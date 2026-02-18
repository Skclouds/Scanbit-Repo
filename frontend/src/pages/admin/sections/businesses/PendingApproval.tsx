import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { Clock, CheckCircle, MoreVertical, Building2, RefreshCw, Mail, Eye, CheckSquare, XSquare, ChevronLeft, ChevronRight, User, Phone, MapPin, Calendar, CreditCard, FileText, } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import api from '@/lib/api';


interface Business {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  businessCategory: string;
  businessType: string;
  isVerified: boolean;
  verificationStatus: string;
  logo?: string;
  profileImage?: string;
  owner?: {
    _id?: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  subscription?: {
    plan: string;
    status: string;
    planPrice?: number;
    daysRemaining?: number;
    startDate?: string;
    endDate?: string;
  };
  onboardingData?: {
    registrationDate?: string;
    verificationRequestDate?: string;
    documentsSubmitted?: boolean;
    documents?: Array<{ type: string; url: string; submittedAt: string }>;
    notes?: string;
    adminNotes?: string;
  };
}

export default function PendingApproval() {
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const fetchPendingBusinesses = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminRestaurants({
        page,
        limit,
        verificationStatus: 'pending',
        isArchived: false,
      });

      if (response.success) {
        // Backend already filters by verificationStatus: 'pending', but ensure we only show truly pending
        const pendingBusinesses = response.data.filter((b: Business) => 
          !b.isVerified || b.verificationStatus === 'pending'
        );
        setBusinesses(pendingBusinesses);
        if (response.pagination) {
          setTotal(response.pagination.total);
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch pending businesses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBusinesses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPendingBusinesses();
    setIsRefreshing(false);
  };

  const handleViewFullDetails = async (businessId: string) => {
    try {
      const response = await api.getAdminRestaurant(businessId);
      if (response.success && response.data) {
        setSelectedBusiness(response.data);
        setViewDialogOpen(true);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch business details',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch business details',
        variant: 'destructive',
      });
    }
  };

  const handleApprove = async (businessId: string) => {
    try {
      await api.updateAdminRestaurant(businessId, {
        isVerified: true,
        verificationStatus: 'verified',
      });
      toast({
        title: 'Success',
        description: 'Business approved successfully',
      });
      handleRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve business',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (businessId: string) => {
    try {
      await api.updateAdminRestaurant(businessId, {
        isVerified: false,
        verificationStatus: 'rejected',
      });
      toast({
        title: 'Success',
        description: 'Business rejected',
      });
      handleRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject business',
        variant: 'destructive',
      });
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pending Approvals</h2>
        <p className="text-slate-600 mt-2">Review and approve businesses waiting for verification</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Review</p>
                <p className="text-3xl font-bold mt-2">{total}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg. Wait Time</p>
                <p className="text-3xl font-bold mt-2">2-3 Days</p>
              </div>
              <Clock className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">This Month</p>
                <p className="text-3xl font-bold mt-2">+{Math.ceil(total * 0.3)}</p>
              </div>
              <Building2 className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Businesses */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Awaiting Verification</CardTitle>
            <CardDescription>
              {total} businesses pending approval
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : businesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-300 mb-4" />
              <p className="text-slate-600 font-medium">No pending approvals</p>
              <p className="text-slate-500 text-sm">All businesses have been verified</p>
            </div>
          ) : (
            <div className="space-y-4">
              {businesses.map((business) => (
                <div
                  key={business._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={business.logo || business.profileImage} />
                      <AvatarFallback className="bg-slate-200">
                        {business.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 truncate">{business.name}</h3>
                        <Badge className="bg-orange-100 text-orange-800 flex gap-1">
                          <Clock className="w-3 h-3" />
                          Pending
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{business.businessCategory}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {business.email}
                        </span>
                        <span>Submitted: {new Date(business.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
                      onClick={() => handleApprove(business._id)}
                    >
                      <CheckSquare className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                      onClick={() => handleReject(business._id)}
                    >
                      <XSquare className="w-4 h-4" />
                      Reject
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>More Options</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer gap-2"
                          onClick={() => handleViewFullDetails(business._id)}
                        >
                          <Eye className="w-4 h-4" />
                          View Full Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Full Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Business Full Details & Onboarding Information</DialogTitle>
            <DialogDescription>Complete information including onboarding details for {selectedBusiness?.name}</DialogDescription>
          </DialogHeader>
          {selectedBusiness && (
            <div className="space-y-6">
              {/* Business Header */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedBusiness.logo || selectedBusiness.profileImage} />
                  <AvatarFallback className="bg-slate-200 text-lg">
                    {selectedBusiness.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedBusiness.name}</h3>
                  <p className="text-sm text-slate-600">{selectedBusiness.email}</p>
                  <Badge className="bg-orange-100 text-orange-800 mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending Approval
                  </Badge>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Business Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Business Category</p>
                    <p className="text-sm text-slate-600">{selectedBusiness.businessCategory}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Business Type</p>
                    <p className="text-sm text-slate-600">{selectedBusiness.businessType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Email
                    </p>
                    <p className="text-sm text-slate-600">{selectedBusiness.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Phone
                    </p>
                    <p className="text-sm text-slate-600">{selectedBusiness.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              {selectedBusiness.address && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address Information
                  </h4>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-sm text-slate-600">
                      {[
                        selectedBusiness.address.street,
                        selectedBusiness.address.city,
                        selectedBusiness.address.state,
                        selectedBusiness.address.zipCode,
                        selectedBusiness.address.country,
                      ].filter(Boolean).join(', ') || 'Address not provided'}
                    </p>
                  </div>
                </div>
              )}

              {/* Owner Information */}
              {selectedBusiness.owner && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Owner Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">Owner Name</p>
                      <p className="text-sm text-slate-600">{selectedBusiness.owner.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">Owner Email</p>
                      <p className="text-sm text-slate-600">{selectedBusiness.owner.email}</p>
                    </div>
                    {selectedBusiness.owner.phone && (
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Owner Phone</p>
                        <p className="text-sm text-slate-600">{selectedBusiness.owner.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Subscription Information */}
              {selectedBusiness.subscription && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Subscription Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">Plan</p>
                      <Badge>{selectedBusiness.subscription.plan}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">Status</p>
                      <Badge variant="outline">{selectedBusiness.subscription.status}</Badge>
                    </div>
                    {selectedBusiness.subscription.planPrice && (
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Plan Price</p>
                        <p className="text-sm text-slate-600">₹{selectedBusiness.subscription.planPrice}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Onboarding Information */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Onboarding Details
                </h4>
                <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Registration Date
                      </p>
                      <p className="text-sm text-slate-600">
                        {selectedBusiness.createdAt 
                          ? new Date(selectedBusiness.createdAt).toLocaleString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Verification Request Date
                      </p>
                      <p className="text-sm text-slate-600">
                        {selectedBusiness.onboardingData?.verificationRequestDate
                          ? new Date(selectedBusiness.onboardingData.verificationRequestDate).toLocaleString()
                          : selectedBusiness.createdAt
                          ? new Date(selectedBusiness.createdAt).toLocaleString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {selectedBusiness.onboardingData?.documentsSubmitted !== undefined && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">Documents Submitted</p>
                      <Badge className={selectedBusiness.onboardingData.documentsSubmitted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'}>
                        {selectedBusiness.onboardingData.documentsSubmitted ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  )}

                  {selectedBusiness.onboardingData?.documents && selectedBusiness.onboardingData.documents.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2">Submitted Documents</p>
                      <div className="space-y-2">
                        {selectedBusiness.onboardingData.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div>
                              <p className="text-sm font-medium">{doc.type}</p>
                              <p className="text-xs text-slate-500">
                                Submitted: {new Date(doc.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(doc.url, '_blank')}
                            >
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedBusiness.onboardingData?.notes && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">Notes</p>
                      <p className="text-sm text-slate-600 bg-white p-2 rounded border">
                        {selectedBusiness.onboardingData.notes}
                      </p>
                    </div>
                  )}

                  {selectedBusiness.onboardingData?.adminNotes && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">Admin Notes</p>
                      <p className="text-sm text-slate-600 bg-white p-2 rounded border">
                        {selectedBusiness.onboardingData.adminNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button 
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                if (selectedBusiness) {
                  handleReject(selectedBusiness._id);
                  setViewDialogOpen(false);
                }
              }}
            >
              Reject
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                if (selectedBusiness) {
                  handleApprove(selectedBusiness._id);
                  setViewDialogOpen(false);
                }
              }}
            >
              Approve Business
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
