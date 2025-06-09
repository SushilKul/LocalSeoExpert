import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { 
  Star, 
  Reply, 
  Search, 
  Filter,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Clock
} from "lucide-react";

export default function Reviews() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: locations } = useQuery({
    queryKey: ["/api/locations"],
    enabled: !!user,
  });

  const { data: pendingReviews, isLoading: pendingLoading } = useQuery({
    queryKey: ["/api/reviews/pending"],
    enabled: !!user,
  });

  // Get all reviews for all locations
  const { data: allReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["/api/reviews/all"],
    queryFn: async () => {
      if (!locations || locations.length === 0) return [];
      
      const reviewPromises = locations.map(async (location: any) => {
        const response = await fetch(`/api/locations/${location.id}/reviews`, {
          credentials: "include",
        });
        if (!response.ok) return [];
        const reviews = await response.json();
        return reviews.map((review: any) => ({
          ...review,
          locationName: location.name,
        }));
      });
      
      const reviewArrays = await Promise.all(reviewPromises);
      return reviewArrays.flat().sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    enabled: !!user && !!locations && locations.length > 0,
  });

  const replyMutation = useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: number; reply: string }) => {
      const response = await apiRequest("POST", `/api/reviews/${reviewId}/reply`, { reply });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setReplyDialogOpen(false);
      setReplyText("");
      setSelectedReview(null);
      toast({
        title: "Reply sent",
        description: "Your reply has been posted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reply.",
        variant: "destructive",
      });
    },
  });

  const handleReply = (review: any) => {
    setSelectedReview(review);
    setReplyDialogOpen(true);
  };

  const submitReply = () => {
    if (!selectedReview || !replyText.trim()) return;
    replyMutation.mutate({
      reviewId: selectedReview.id,
      reply: replyText.trim(),
    });
  };

  const filteredReviews = allReviews?.filter((review: any) => {
    const matchesSearch = 
      review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.locationName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = filterRating === "all" || review.rating.toString() === filterRating;
    
    const matchesStatus = 
      filterStatus === "all" ||
      (filterStatus === "replied" && review.reply) ||
      (filterStatus === "pending" && !review.reply);
    
    return matchesSearch && matchesRating && matchesStatus;
  }) || [];

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getSentimentColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const averageRating = allReviews?.length > 0 
    ? allReviews.reduce((sum: number, review: any) => sum + review.rating, 0) / allReviews.length
    : 0;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Review Management</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and respond to customer reviews across all your locations
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                    <p className="text-3xl font-bold text-foreground">
                      {allReviews?.length || 0}
                    </p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Replies</p>
                    <p className="text-3xl font-bold text-foreground">
                      {pendingReviews?.length || 0}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                    <p className="text-3xl font-bold text-foreground">
                      {averageRating.toFixed(1)}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                    <p className="text-3xl font-bold text-foreground">
                      {allReviews?.length > 0 
                        ? Math.round((allReviews.filter((r: any) => r.reply).length / allReviews.length) * 100)
                        : 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Customer Reviews</CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reviews..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="border border-input rounded-md px-3 py-2 bg-background"
                  >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-input rounded-md px-3 py-2 bg-background"
                  >
                    <option value="all">All Reviews</option>
                    <option value="pending">Pending Reply</option>
                    <option value="replied">Replied</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {reviewsLoading ? (
                <div className="space-y-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-32 mb-2" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredReviews.length > 0 ? (
                <div className="space-y-6">
                  {filteredReviews.map((review: any) => (
                    <div key={review.id} className="border rounded-lg p-6 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(review.customerName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-medium text-foreground">
                                {review.customerName}
                              </h3>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {review.locationName}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                              {!review.reply && (
                                <Badge variant="secondary" className="text-orange-600">
                                  Pending
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {review.comment && (
                            <p className="text-foreground mb-4">{review.comment}</p>
                          )}

                          {review.reply && (
                            <div className="bg-accent rounded-lg p-4 mb-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <Reply className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Your Response:</span>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(review.repliedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm">{review.reply}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${getSentimentColor(review.rating)}`}>
                                {review.rating >= 4 ? "Positive" : review.rating >= 3 ? "Neutral" : "Negative"}
                              </span>
                            </div>
                            {!review.reply && (
                              <Button
                                size="sm"
                                onClick={() => handleReply(review)}
                                className="bg-primary hover:bg-primary/90"
                              >
                                <Reply className="h-4 w-4 mr-2" />
                                Reply
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchTerm || filterRating !== "all" || filterStatus !== "all" 
                      ? "No reviews found" 
                      : "No reviews yet"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterRating !== "all" || filterStatus !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Reviews will appear here once customers start leaving feedback"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reply Dialog */}
          <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Reply to Review</DialogTitle>
              </DialogHeader>
              {selectedReview && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-accent/50">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">{selectedReview.customerName}</span>
                      <div className="flex">
                        {[...Array(selectedReview.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm">{selectedReview.comment}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Reply</label>
                    <Textarea
                      placeholder="Thank you for your feedback..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setReplyDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={submitReply}
                      disabled={!replyText.trim() || replyMutation.isPending}
                    >
                      {replyMutation.isPending ? "Sending..." : "Send Reply"}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
