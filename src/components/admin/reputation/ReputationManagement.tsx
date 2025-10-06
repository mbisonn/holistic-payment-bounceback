import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { GoogleMyBusinessSetup } from './GoogleMyBusinessSetup';

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

const ReputationManagement = () => {
  const [stats, setStats] = useState<ReputationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleReviews, setGoogleReviews] = useState<GoogleReview[]>([]);

  useEffect(() => {
    fetchStats();
    checkGoogleConnection();
  }, []);

  const checkGoogleConnection = () => {
    const connected = localStorage.getItem('google_my_business_connected') === 'true';
    setGoogleConnected(connected);
    if (connected) {
      fetchGoogleReviews();
    }
    setLoading(false);
  };

  const handleGoogleConnect = () => {
    setGoogleConnected(true);
    fetchGoogleReviews();
  };

  const handleGoogleDisconnect = () => {
    setGoogleConnected(false);
    setGoogleReviews([]);
  };

  const fetchGoogleReviews = async () => {
    // Mock Google reviews
    const mockReviews: GoogleReview[] = [
      {
        id: 'review_1',
        reviewer: {
          displayName: 'John Doe',
          isAnonymous: false
        },
        starRating: 'FIVE',
        comment: 'Excellent service and great products! Highly recommended.',
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      },
      {
        id: 'review_2',
        reviewer: {
          displayName: 'Jane Smith',
          isAnonymous: false
        },
        starRating: 'FOUR',
        comment: 'Very good experience. Fast shipping and quality products.',
        createTime: new Date(Date.now() - 86400000).toISOString(),
        updateTime: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    
    setGoogleReviews(mockReviews);
    calculateStats(mockReviews);
  };

  const calculateStats = (reviews: GoogleReview[]) => {
    const ratingMap: { [key: string]: number } = {
      'FIVE': 5,
      'FOUR': 4,
      'THREE': 3,
      'TWO': 2,
      'ONE': 1
    };

    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + ratingMap[review.starRating], 0);
    const average = total > 0 ? sum / total : 0;

    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      const rating = ratingMap[review.starRating];
      distribution[rating] = (distribution[rating] || 0) + 1;
    });

    const withReplies = reviews.filter(r => r.reviewReply).length;
    const responseRate = total > 0 ? (withReplies / total) * 100 : 0;

    setStats({
      total_reviews: total,
      average_rating: average,
      rating_distribution: distribution,
      response_rate: responseRate,
      recent_trend: 'up',
      pending_reviews: 0,
      flagged_reviews: 0
    });
  };

  const fetchStats = () => {
    // Initialize with empty stats
    setStats({
      total_reviews: 0,
      average_rating: 0,
      rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      response_rate: 0,
      recent_trend: 'stable',
      pending_reviews: 0,
      flagged_reviews: 0
    });
  };

  const getStarRatingNumber = (rating: string): number => {
    const map: { [key: string]: number } = {
      'FIVE': 5, 'FOUR': 4, 'THREE': 3, 'TWO': 2, 'ONE': 1
    };
    return map[rating] || 0;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Reputation Management</h1>
          <p className="text-gray-300">Manage your online reputation and reviews</p>
        </div>
        {googleConnected && (
          <Button 
            onClick={fetchGoogleReviews} 
            variant="outline"
            className="glass-button-outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Reviews
          </Button>
        )}
      </div>

      {/* Google My Business Setup */}
      <GoogleMyBusinessSetup
        onConnect={handleGoogleConnect}
        isConnected={googleConnected}
        onDisconnect={handleGoogleDisconnect}
      />

      {/* Statistics Overview */}
      {googleConnected && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card border-white/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-300">Total Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.total_reviews}</div>
              <div className="flex items-center gap-1 mt-2 text-sm">
                {stats.recent_trend === 'up' ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-green-400">Trending up</span>
                  </>
                ) : stats.recent_trend === 'down' ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-400" />
                    <span className="text-red-400">Trending down</span>
                  </>
                ) : (
                  <span className="text-gray-400">Stable</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-300">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-white">
                  {stats.average_rating.toFixed(1)}
                </div>
                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(stats.average_rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-300">Response Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {stats.response_rate.toFixed(0)}%
              </div>
              <p className="text-sm text-gray-400 mt-2">
                of reviews responded to
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-300">Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm text-gray-300 w-3">{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-yellow-400 h-full"
                        style={{
                          width: `${stats.total_reviews > 0 ? ((stats.rating_distribution[rating] || 0) / stats.total_reviews) * 100 : 0}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 w-8 text-right">
                      {stats.rating_distribution[rating] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Google Reviews List */}
      {googleConnected && googleReviews.length > 0 && (
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Recent Google Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {googleReviews.map((review) => (
                <div key={review.id} className="glass-secondary p-4 rounded-lg border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        {review.reviewer.displayName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{review.reviewer.displayName}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= getStarRatingNumber(review.starRating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(review.createTime).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-300 mb-3">{review.comment}</p>
                  )}
                  {review.reviewReply && (
                    <div className="mt-3 pl-4 border-l-2 border-blue-500/30 bg-blue-500/10 p-3 rounded-r">
                      <p className="text-sm font-medium text-blue-300 mb-1">Business Response</p>
                      <p className="text-sm text-gray-300">{review.reviewReply.comment}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {googleConnected && googleReviews.length === 0 && (
        <Card className="glass-card border-white/20">
          <CardContent className="py-12">
            <div className="text-center">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No reviews yet</h3>
              <p className="text-gray-400">
                Reviews from Google My Business will appear here once they're submitted
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReputationManagement;
