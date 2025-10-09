import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Star, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Eye, 
  Reply, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Building,
  Bell,
  BellOff,
  Link2,
  Unlink,
  RefreshCw,
  MapPin,
  Phone,
  Edit,
  AlertCircle,
  Save,
  Send
} from 'lucide-react';

interface Review {
  id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  title: string;
  content: string;
  source: 'google' | 'facebook' | 'website' | 'manual';
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  response?: string;
  response_date?: string;
  created_at: string;
  updated_at: string;
  verified: boolean;
  helpful_votes: number;
  reported: boolean;
}

interface ReputationStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: { [key: number]: number };
  response_rate: number;
  recent_trend: 'up' | 'down' | 'stable';
  pending_reviews: number;
  flagged_reviews: number;
}

interface GoogleReview {
  id: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
    isAnonymous: boolean;
  };
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

interface BusinessLocation {
  name: string;
  locationName: string;
  address: string;
  phone?: string;
  websiteUrl?: string;
  averageRating: number;
  totalReviewCount: number;
  newReviewCount: number;
  locationId: string;
  isConnected: boolean;
}

const ReputationManagement = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReputationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseDialog, setResponseDialog] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Google My Business state
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleConnecting, setGoogleConnecting] = useState(false);
  // Removed unused businessLocations state
  const [selectedLocation, setSelectedLocation] = useState<BusinessLocation | null>(null);
  const [googleReviews, setGoogleReviews] = useState<GoogleReview[]>([]);
  const [loadingGoogleReviews, setLoadingGoogleReviews] = useState(false);
  const [googleReplyDialog, setGoogleReplyDialog] = useState(false);
  const [selectedGoogleReview, setSelectedGoogleReview] = useState<GoogleReview | null>(null);
  const [googleReplyText, setGoogleReplyText] = useState('');
  const [googleNotifications, setGoogleNotifications] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
    fetchStats();
    checkGoogleConnection();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [reviews, searchTerm, statusFilter, sourceFilter, ratingFilter]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch reviews',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkGoogleConnection = async () => {
    // Check if Google My Business is connected (mock implementation)
    const connected = localStorage.getItem('google_my_business_connected') === 'true';
    if (connected) {
      setGoogleConnected(true);
      // Load mock business locations
      const mockLocation: BusinessLocation = {
        name: 'Bounce Back to Life Consult',
        locationName: 'Main Office',
        address: '123 Business St, City, State 12345',
        phone: '(555) 123-4567',
        websiteUrl: 'https://www.bouncebacktolifeconsult.pro',
        averageRating: 4.7,
        totalReviewCount: 156,
        newReviewCount: 3,
        locationId: 'loc_123456',
        isConnected: true
      };
      setSelectedLocation(mockLocation);
      fetchGoogleReviews();
    }
  };

  const connectGoogleAccount = () => {
    setGoogleConnecting(true);
    
    // Mock connection process
    setTimeout(() => {
      localStorage.setItem('google_my_business_connected', 'true');
      setGoogleConnected(true);
      
      const mockLocation: BusinessLocation = {
        name: 'Bounce Back to Life Consult',
        locationName: 'Main Office',
        address: '123 Business St, City, State 12345',
        phone: '(555) 123-4567',
        websiteUrl: 'https://www.bouncebacktolifeconsult.pro',
        averageRating: 4.7,
        totalReviewCount: 156,
        newReviewCount: 3,
        locationId: 'loc_123456',
        isConnected: true
      };
      setSelectedLocation(mockLocation);
      setGoogleConnecting(false);
      fetchGoogleReviews();
      
      toast({
        title: 'Success!',
        description: 'Google My Business account connected successfully'
      });
    }, 2000);
  };

  const disconnectGoogle = () => {
    localStorage.removeItem('google_my_business_connected');
    setGoogleConnected(false);
    setGoogleReviews([]);
    setSelectedLocation(null);
    
    toast({
      title: 'Disconnected',
      description: 'Google My Business account disconnected'
    });
  };

  const fetchGoogleReviews = () => {
    setLoadingGoogleReviews(true);
    // Mock Google reviews
    const mockReviews: GoogleReview[] = [
      {
        id: 'google_review_1',
        reviewer: {
          displayName: 'John Smith',
          isAnonymous: false
        },
        starRating: 'FIVE',
        comment: 'Excellent service! The team was very professional and helped me through every step of the process.',
        createTime: '2024-01-15T10:30:00Z',
        updateTime: '2024-01-15T10:30:00Z',
        reviewReply: {
          comment: 'Thank you so much for your kind words! We are thrilled to hear about your positive experience.',
          updateTime: '2024-01-15T14:00:00Z'
        }
      },
      {
        id: 'google_review_2',
        reviewer: {
          displayName: 'Sarah Johnson',
          isAnonymous: false
        },
        starRating: 'FOUR',
        comment: 'Good experience overall. Quick response times and helpful staff.',
        createTime: '2024-01-14T15:45:00Z',
        updateTime: '2024-01-14T15:45:00Z'
      },
      {
        id: 'google_review_3',
        reviewer: {
          displayName: 'Mike Wilson',
          isAnonymous: false
        },
        starRating: 'FIVE',
        comment: 'Outstanding! Exceeded all my expectations. Highly recommend!',
        createTime: '2024-01-13T09:20:00Z',
        updateTime: '2024-01-13T09:20:00Z'
      },
      {
        id: 'google_review_4',
        reviewer: {
          displayName: 'Anonymous',
          isAnonymous: true
        },
        starRating: 'THREE',
        comment: 'Service was okay but could be improved in some areas.',
        createTime: '2024-01-12T11:00:00Z',
        updateTime: '2024-01-12T11:00:00Z'
      }
    ];
    
    setTimeout(() => {
      setGoogleReviews(mockReviews);
      setLoadingGoogleReviews(false);
    }, 1000);
  };

  const sendGoogleReply = () => {
    if (!selectedGoogleReview || !googleReplyText.trim()) return;

    // Mock sending reply
    const updatedReviews = googleReviews.map(r => 
      r.id === selectedGoogleReview.id 
        ? { ...r, reviewReply: { comment: googleReplyText, updateTime: new Date().toISOString() } }
        : r
    );
    
    setGoogleReviews(updatedReviews);
    setGoogleReplyDialog(false);
    setGoogleReplyText('');
    
    toast({
      title: 'Reply Sent!',
      description: 'Your reply has been posted to Google'
    });
  };

  const getGoogleStarValue = (rating: string): number => {
    const ratingMap: Record<string, number> = {
      'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5
    };
    return ratingMap[rating] || 0;
  };

  const fetchStats = async () => {
    try {
      // Calculate stats from reviews
      const totalReviews = reviews.length;
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;
      
      const ratingDistribution = reviews.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      }, {} as { [key: number]: number });

      const respondedReviews = reviews.filter(r => r.response).length;
      const responseRate = totalReviews > 0 ? (respondedReviews / totalReviews) * 100 : 0;

      const pendingReviews = reviews.filter(r => r.status === 'pending').length;
      const flaggedReviews = reviews.filter(r => r.status === 'flagged').length;

      // Calculate trend (simplified)
      const recentReviews = reviews.slice(0, 10);
      const olderReviews = reviews.slice(10, 20);
      const recentAvg = recentReviews.length > 0 
        ? recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length 
        : 0;
      const olderAvg = olderReviews.length > 0 
        ? olderReviews.reduce((sum, r) => sum + r.rating, 0) / olderReviews.length 
        : 0;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (recentAvg > olderAvg + 0.2) trend = 'up';
      else if (recentAvg < olderAvg - 0.2) trend = 'down';

      setStats({
        total_reviews: totalReviews,
        average_rating: averageRating,
        rating_distribution: ratingDistribution,
        response_rate: responseRate,
        recent_trend: trend,
        pending_reviews: pendingReviews,
        flagged_reviews: flaggedReviews
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const filterReviews = () => {
    let filtered = reviews;

    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(review => review.status === statusFilter);
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(review => review.source === sourceFilter);
    }

    if (ratingFilter !== 'all') {
      filtered = filtered.filter(review => review.rating === parseInt(ratingFilter));
    }

    setFilteredReviews(filtered);
  };

  const updateReviewStatus = async (reviewId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status })
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(prev => prev.map(review =>
        review.id === reviewId ? { ...review, status: status as any } : review
      ));

      toast({
        title: 'Success',
        description: 'Review status updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update review status',
        variant: 'destructive'
      });
    }
  };

  const addResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          response: responseText,
          response_date: new Date().toISOString()
        })
        .eq('id', selectedReview.id);

      if (error) throw error;

      setReviews(prev => prev.map(review =>
        review.id === selectedReview.id 
          ? { ...review, response: responseText, response_date: new Date().toISOString() }
          : review
      ));

      setResponseDialog(false);
      setResponseText('');
      setSelectedReview(null);

      toast({
        title: 'Success',
        description: 'Response added successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add response',
        variant: 'destructive'
      });
    }
  };

  // removed unused getRatingColor

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'flagged': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'google': return '🔍';
      case 'facebook': return '📘';
      case 'website': return '🌐';
      case 'manual': return '✋';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Reputation Management</h2>
          <p className="text-gray-300">Monitor and manage your online reviews and reputation</p>
        </div>
        <Button className="bounce-back-consult-button">
          <Building className="h-4 w-4 mr-2" />
          Connect Google My Business
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bounce-back-consult-card border-white/20 bg-transparent">
          <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="google" className="text-white data-[state=active]:bg-white/20">
            <Building className="h-4 w-4 mr-2" />
            Google My Business
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bounce-back-consult-card border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Average Rating</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold text-white">{stats.average_rating.toFixed(1)}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= Math.round(stats.average_rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className={`p-3 rounded-full ${
                      stats.recent_trend === 'up' ? 'bg-green-500/20' :
                      stats.recent_trend === 'down' ? 'bg-red-500/20' : 'bg-gray-500/20'
                    }`}>
                      {stats.recent_trend === 'up' ? (
                        <TrendingUp className="h-6 w-6 text-green-400" />
                      ) : stats.recent_trend === 'down' ? (
                        <TrendingDown className="h-6 w-6 text-red-400" />
                      ) : (
                        <BarChart3 className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bounce-back-consult-card border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Total Reviews</p>
                      <p className="text-2xl font-bold text-white">{stats.total_reviews}</p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-500/20">
                      <MessageSquare className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bounce-back-consult-card border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Response Rate</p>
                      <p className="text-2xl font-bold text-white">{stats.response_rate.toFixed(1)}%</p>
                    </div>
                    <div className="p-3 rounded-full bg-purple-500/20">
                      <Reply className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bounce-back-consult-card border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Pending Reviews</p>
                      <p className="text-2xl font-bold text-white">{stats.pending_reviews}</p>
                    </div>
                    <div className="p-3 rounded-full bg-yellow-500/20">
                      <AlertTriangle className="h-6 w-6 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Rating Distribution */}
          {stats && (
            <Card className="bounce-back-consult-card border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats.rating_distribution[rating] || 0;
                    const percentage = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
                    
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16">
                          <span className="text-sm text-gray-300">{rating}</span>
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        </div>
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-300 w-12 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          {/* Filters */}
          <Card className="bounce-back-consult-card border-white/20">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search reviews..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bounce-back-consult-input text-white border-white/20"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] bounce-back-consult-input text-white border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bounce-back-consult-card border-white/20">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-[150px] bounce-back-consult-input text-white border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bounce-back-consult-card border-white/20">
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="w-[150px] bounce-back-consult-input text-white border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bounce-back-consult-card border-white/20">
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="bounce-back-consult-card border-white/20 hover:border-white/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-400">{getSourceIcon(review.source)} {review.source}</span>
                        <Badge className={getStatusColor(review.status)}>
                          {review.status}
                        </Badge>
                        {review.verified && (
                          <Badge variant="outline" className="border-green-500 text-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-white font-semibold text-lg mb-2">{review.title}</h3>
                      <p className="text-gray-300 mb-3">{review.content}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>By {review.customer_name}</span>
                        <span>•</span>
                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                        {review.helpful_votes > 0 && (
                          <>
                            <span>•</span>
                            <span>{review.helpful_votes} helpful</span>
                          </>
                        )}
                      </div>

                      {review.response && (
                        <div className="mt-4 p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Reply className="h-4 w-4 text-blue-400" />
                            <span className="text-sm font-medium text-blue-400">Business Response</span>
                            {review.response_date && (
                              <span className="text-xs text-gray-400">
                                {new Date(review.response_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm">{review.response}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReview(review);
                          setResponseDialog(true);
                        }}
                        className="bounce-back-consult-button-outline"
                      >
                        <Reply className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReview(review)}
                        className="bounce-back-consult-button-outline"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Select
                        value={review.status}
                        onValueChange={(value) => updateReviewStatus(review.id, value)}
                      >
                        <SelectTrigger className="w-[120px] bounce-back-consult-input text-white border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bounce-back-consult-card border-white/20">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approve</SelectItem>
                          <SelectItem value="rejected">Reject</SelectItem>
                          <SelectItem value="flagged">Flag</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="responses" className="space-y-6">
          <Card className="bounce-back-consult-card border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Response Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Thank You Response</h4>
                  <p className="text-gray-300 text-sm mb-3">For positive reviews</p>
                  <Button size="sm" className="bounce-back-consult-button">
                    Use Template
                  </Button>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Apology Response</h4>
                  <p className="text-gray-300 text-sm mb-3">For negative reviews</p>
                  <Button size="sm" className="bounce-back-consult-button">
                    Use Template
                  </Button>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Follow-up Response</h4>
                  <p className="text-gray-300 text-sm mb-3">For resolution requests</p>
                  <Button size="sm" className="bounce-back-consult-button">
                    Use Template
                  </Button>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Custom Response</h4>
                  <p className="text-gray-300 text-sm mb-3">Create your own</p>
                  <Button size="sm" className="bounce-back-consult-button">
                    Create New
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="google" className="space-y-6">
          {/* Google My Business Integration */}
          <Card className="bounce-back-consult-card border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building className="h-6 w-6 text-blue-500" />
                  <div>
                    <CardTitle className="text-white">Google My Business Integration</CardTitle>
                    <p className="text-gray-400 text-sm">Manage reviews and respond directly from your dashboard</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {googleConnected && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setGoogleNotifications(!googleNotifications)}
                      className="text-gray-400 hover:text-white"
                    >
                      {googleNotifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    </Button>
                  )}
                  {googleConnected ? (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-600 text-gray-300">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Not Connected
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!googleConnected ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <p className="text-gray-400">
                      Enter your Google My Business details to connect:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Business Name
                        </label>
                        <Input
                          placeholder="Enter your business name"
                          className="bounce-back-consult-input text-white border-white/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Business Address
                        </label>
                        <Input
                          placeholder="Enter your business address"
                          className="bounce-back-consult-input text-white border-white/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Phone Number
                        </label>
                        <Input
                          placeholder="Enter your business phone"
                          className="bounce-back-consult-input text-white border-white/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Google Business ID
                        </label>
                        <Input
                          placeholder="Enter your Google Business ID"
                          className="bounce-back-consult-input text-white border-white/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 text-gray-400">
                      <p className="text-sm">Benefits of connecting:</p>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          View all your Google reviews in one place
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          Respond to reviews directly from this dashboard
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          Get instant notifications for new reviews
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          Track review trends and analytics
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={connectGoogleAccount}
                      disabled={googleConnecting}
                      className="bounce-back-consult-button"
                    >
                      {googleConnecting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Link2 className="h-4 w-4 mr-2" />
                          Connect Google My Business
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={connectGoogleAccount}
                      disabled={googleConnecting}
                      className="bounce-back-consult-button"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Business Location */}
                  {selectedLocation && (
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-medium">{selectedLocation.locationName}</h3>
                          {selectedLocation.newReviewCount > 0 && (
                            <Badge className="bg-red-500 text-white">
                              {selectedLocation.newReviewCount} new
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-2 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {selectedLocation.address}
                          </div>
                          {selectedLocation.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {selectedLocation.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="text-white font-medium">{selectedLocation.averageRating.toFixed(1)}</span>
                            <span>({selectedLocation.totalReviewCount} reviews)</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchGoogleReviews()}
                      className="bounce-back-consult-button-outline"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={disconnectGoogle}
                      className="text-red-400 hover:text-red-300 hover:bg-red-950"
                    >
                      <Unlink className="h-4 w-4 mr-1" />
                      Disconnect
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Google Reviews List */}
          {googleConnected && selectedLocation && (
            <Card className="bounce-back-consult-card border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Google Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingGoogleReviews ? (
                  <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                  </div>
                ) : googleReviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No reviews found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {googleReviews.map((review) => (
                      <Card key={review.id} className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <div>
                                <p className="text-white font-medium">
                                  {review.reviewer.isAnonymous ? 'Anonymous' : review.reviewer.displayName}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < getGoogleStarValue(review.starRating)
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-600'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-400">
                                    {new Date(review.createTime).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedGoogleReview(review);
                                setGoogleReplyDialog(true);
                                setGoogleReplyText(review.reviewReply?.comment || '');
                              }}
                              className="text-gray-400 hover:text-white"
                            >
                              {review.reviewReply ? (
                                <>
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit Reply
                                </>
                              ) : (
                                <>
                                  <Reply className="h-4 w-4 mr-1" />
                                  Reply
                                </>
                              )}
                            </Button>
                          </div>

                          {review.comment && (
                            <p className="text-gray-300 mb-3">{review.comment}</p>
                          )}

                          {review.reviewReply && (
                            <div className="bg-white/5 rounded-lg p-3 mt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-blue-500 text-white text-xs">
                                  Your Reply
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  {new Date(review.reviewReply.updateTime).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm">{review.reviewReply.comment}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={responseDialog} onOpenChange={setResponseDialog}>
        <DialogContent className="bounce-back-consult-card border-white/20 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Review</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= selectedReview.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">by {selectedReview.customer_name}</span>
                </div>
                <h4 className="text-white font-medium mb-1">{selectedReview.title}</h4>
                <p className="text-gray-300 text-sm">{selectedReview.content}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Your Response
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write your response here..."
                  className="w-full h-32 p-3 bounce-back-consult-input text-white border-white/20 rounded-lg resize-none"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setResponseDialog(false)}
                  className="bounce-back-consult-button-outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addResponse}
                  disabled={!responseText.trim()}
                  className="bounce-back-consult-button"
                >
                  Post Response
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Google Reply Dialog */}
      <Dialog open={googleReplyDialog} onOpenChange={setGoogleReplyDialog}>
        <DialogContent className="bounce-back-consult-card border-white/20 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedGoogleReview?.reviewReply ? 'Edit Google Reply' : 'Reply to Google Review'}
            </DialogTitle>
          </DialogHeader>
          {selectedGoogleReview && (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < getGoogleStarValue(selectedGoogleReview.starRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">by {selectedGoogleReview.reviewer.displayName}</span>
                </div>
                <p className="text-gray-300 text-sm">{selectedGoogleReview.comment}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Your Reply
                </label>
                <textarea
                  value={googleReplyText}
                  onChange={(e) => setGoogleReplyText(e.target.value)}
                  placeholder="Thank you for your review..."
                  className="w-full h-32 p-3 bounce-back-consult-input text-white border-white/20 rounded-lg resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Tip: Be professional, acknowledge their feedback, and address any concerns
                </p>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setGoogleReplyDialog(false)}
                  className="bounce-back-consult-button-outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendGoogleReply}
                  disabled={!googleReplyText.trim()}
                  className="bounce-back-consult-button"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {selectedGoogleReview?.reviewReply ? 'Update Reply' : 'Send Reply'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReputationManagement;

