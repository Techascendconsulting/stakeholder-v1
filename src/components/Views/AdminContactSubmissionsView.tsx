import React, { useState, useEffect } from 'react';
import { Mail, Eye, Check, Archive, Trash2, Clock, User, RefreshCw, Filter } from 'lucide-react';
import { 
  getAllContactSubmissions, 
  updateContactSubmissionStatus, 
  deleteContactSubmission,
  ContactSubmission 
} from '../../services/contactService';

const AdminContactSubmissionsView: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    const data = await getAllContactSubmissions();
    setSubmissions(data);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: 'new' | 'in_progress' | 'resolved' | 'archived') => {
    const result = await updateContactSubmissionStatus(id, status, adminNotes);
    if (result.success) {
      await loadSubmissions();
      setAdminNotes('');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this submission?')) {
      const result = await deleteContactSubmission(id);
      if (result.success) {
        await loadSubmissions();
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(null);
        }
      }
    }
  };

  const filteredSubmissions = filterStatus === 'all' 
    ? submissions 
    : submissions.filter(s => s.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'archived': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Mail className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <Check className="w-4 h-4" />;
      case 'archived': return <Archive className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Contact Submissions</h1>
              <p className="text-gray-600">Manage and respond to contact form inquiries</p>
            </div>
            <button
              onClick={loadSubmissions}
              className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{submissions.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{submissions.filter(s => s.status === 'new').length}</div>
              <div className="text-sm text-blue-700">New</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 shadow-sm border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">{submissions.filter(s => s.status === 'in_progress').length}</div>
              <div className="text-sm text-yellow-700">In Progress</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 shadow-sm border border-green-200">
              <div className="text-2xl font-bold text-green-700">{submissions.filter(s => s.status === 'resolved').length}</div>
              <div className="text-sm text-green-700">Resolved</div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Submissions</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submissions List */}
          <div className="space-y-4 max-h-[800px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading submissions...</p>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No submissions found</p>
              </div>
            ) : (
              filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  onClick={() => setSelectedSubmission(submission)}
                  className={`bg-white rounded-2xl p-6 shadow-sm border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedSubmission?.id === submission.id 
                      ? 'border-purple-500 shadow-lg' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{submission.name}</h3>
                      <p className="text-sm text-purple-600">{submission.email}</p>
                    </div>
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(submission.status || 'new')}`}>
                      {getStatusIcon(submission.status || 'new')}
                      <span className="capitalize">{submission.status || 'new'}</span>
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">{submission.subject}</h4>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{submission.message}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(submission.created_at || '').toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                    <button className="text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Details Panel */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sticky top-8">
            {selectedSubmission ? (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedSubmission.subject}</h2>
                    <p className="text-sm text-gray-500">
                      Submitted {new Date(selectedSubmission.created_at || '').toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`inline-flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(selectedSubmission.status || 'new')}`}>
                    {getStatusIcon(selectedSubmission.status || 'new')}
                    <span className="capitalize">{selectedSubmission.status || 'new'}</span>
                  </span>
                </div>

                {/* Contact Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">{selectedSubmission.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <a href={`mailto:${selectedSubmission.email}`} className="text-purple-600 hover:text-purple-700">
                      {selectedSubmission.email}
                    </a>
                  </div>
                </div>

                {/* Message */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Message</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedSubmission.message}</p>
                  </div>
                </div>

                {/* Admin Notes */}
                {selectedSubmission.admin_notes && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Admin Notes</h3>
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                      <p className="text-gray-700">{selectedSubmission.admin_notes}</p>
                    </div>
                  </div>
                )}

                {/* Add Notes */}
                <div className="mb-6">
                  <label htmlFor="adminNotes" className="block font-semibold text-gray-900 mb-2">
                    Add Notes
                  </label>
                  <textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Add internal notes about this submission..."
                  />
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleStatusChange(selectedSubmission.id!, 'in_progress')}
                      className="flex items-center justify-center space-x-2 bg-yellow-600 text-white px-4 py-3 rounded-xl hover:bg-yellow-700 transition-all duration-300 font-medium"
                    >
                      <Clock className="w-5 h-5" />
                      <span>In Progress</span>
                    </button>
                    
                    <button
                      onClick={() => handleStatusChange(selectedSubmission.id!, 'resolved')}
                      className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition-all duration-300 font-medium"
                    >
                      <Check className="w-5 h-5" />
                      <span>Resolve</span>
                    </button>
                    
                    <button
                      onClick={() => handleStatusChange(selectedSubmission.id!, 'archived')}
                      className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-3 rounded-xl hover:bg-gray-700 transition-all duration-300 font-medium"
                    >
                      <Archive className="w-5 h-5" />
                      <span>Archive</span>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(selectedSubmission.id!)}
                      className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-700 transition-all duration-300 font-medium"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span>Delete</span>
                    </button>
                  </div>

                  {/* Reply via Email */}
                  <a
                    href={`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`}
                    className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-xl hover:bg-purple-700 transition-all duration-300 font-medium mt-4"
                  >
                    <Mail className="w-5 h-5" />
                    <span>Reply via Email</span>
                  </a>
                </div>
              </>
            ) : (
              <div className="text-center py-24 text-gray-400">
                <Mail className="w-24 h-24 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Select a submission to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContactSubmissionsView;













