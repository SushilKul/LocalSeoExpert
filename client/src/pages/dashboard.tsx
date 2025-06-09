import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Phone, Eye, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
  });

  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ["/api/locations"],
    enabled: !!user,
  });

  const { data: recentPosts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts", { limit: 5 }],
    enabled: !!user,
  });

  const { data: pendingReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["/api/reviews/pending"],
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">
              Monitor your local SEO performance and Google Business Profile activity
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Locations</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16 mt-2" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground">{stats?.totalLocations || 0}</p>
                    )}
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">Active</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16 mt-2" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground">{stats?.pendingReviews || 0}</p>
                    )}
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-orange-600 font-medium">Needs attention</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Star className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16 mt-2" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground">
                        {stats?.averageRating ? stats.averageRating.toFixed(1) : "0.0"}
                      </p>
                    )}
                    <div className="flex items-center mt-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground ml-2">
                        {stats?.totalReviews || 0} reviews
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16 mt-2" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground">
                        {stats?.totalViews ? (stats.totalViews / 1000).toFixed(1) + "K" : "0"}
                      </p>
                    )}
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">This month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Locations Overview */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Your Locations</CardTitle>
                  <Button onClick={() => setLocation("/locations")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </CardHeader>
                <CardContent>
                  {locationsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-lg" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                          </div>
                          <Skeleton className="h-8 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : locations && locations.length > 0 ? (
                    <div className="space-y-4">
                      {locations.slice(0, 5).map((location: any) => (
                        <div key={location.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <MapPin className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">{location.name}</h3>
                              <p className="text-sm text-muted-foreground">{location.address}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant={location.status === "verified" ? "default" : "secondary"}>
                              {location.status}
                            </Badge>
                            <div className="text-right">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                <span className="font-medium">
                                  {location.rating ? parseFloat(location.rating).toFixed(1) : "0.0"}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {location.reviewCount || 0} reviews
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No locations yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Add your first business location to get started
                      </p>
                      <Button onClick={() => setLocation("/locations")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Location
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Posts */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Posts</CardTitle>
                  <Button variant="outline" size="sm">Create Post</Button>
                </CardHeader>
                <CardContent>
                  {postsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex space-x-4">
                          <Skeleton className="h-12 w-12 rounded-lg" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-5 w-full mb-1" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentPosts && recentPosts.length > 0 ? (
                    <div className="space-y-4">
                      {recentPosts.map((post: any) => (
                        <div key={post.id} className="flex space-x-4 p-3 border rounded-lg">
                          <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                            <Plus className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant="outline">{post.type.replace('_', ' ')}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="font-medium">{post.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {post.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first post to engage with customers
                      </p>
                      <Button>Create Post</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Post
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="h-4 w-4 mr-2" />
                    Manage Reviews
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </CardContent>
              </Card>

              {/* Pending Reviews */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Pending Reviews</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setLocation("/reviews")}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  {reviewsLoading ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : pendingReviews && pendingReviews.length > 0 ? (
                    <div className="space-y-4">
                      {pendingReviews.slice(0, 3).map((review: any) => (
                        <div key={review.id} className="border-l-4 border-primary pl-4">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="flex text-yellow-400">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-current" />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {review.rating}.0
                            </span>
                          </div>
                          <p className="text-sm line-clamp-2 mb-2">{review.comment}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {review.customerName}
                            </span>
                            <Button size="sm" variant="outline">
                              Reply
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Star className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No pending reviews</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
