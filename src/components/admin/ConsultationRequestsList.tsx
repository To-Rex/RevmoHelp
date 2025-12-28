import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Eye,
  Phone,
  Mail,
  Calendar,
  User,
  Stethoscope,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { 
  getConsultationRequests, 
  updateConsultationRequest, 
  deleteConsultationRequest 
} from '../../lib/consultationRequests';
import type { ConsultationRequest } from '../../lib/consultationRequests';

interface ConsultationRequestsListProps {
  searchTerm: string;
  selectedStatus: string;
}

const ConsultationRequestsList: React.FC<ConsultationRequestsListProps> = ({
  searchTerm,
  selectedStatus
}) => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const { data } = await getConsultationRequests();
      if (data) {
        setRequests(data);
      }
    } catch (error) {
      console.error('Error loading consultation requests:', error);
      setMessage({ type: 'error', text: t('errorLoadingConsultationRequests') });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    setUpdateLoading(requestId);
    setMessage({ type: '', text: '' });
    
    try {
      const { error } = await updateConsultationRequest({
        id: requestId,
        status: newStatus as any
      });
      
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: t('statusUpdated') });
        await loadRequests();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi' });
    } finally {
      setUpdateLoading(null);
    }
  };

  const handleDelete = async (requestId: string, patientName: string) => {
    if (!confirm(`${patientName}${t('confirmDeleteRequest')}`)) return;

    setDeleteLoading(requestId);
    setMessage({ type: '', text: '' });
    
    try {
      const { error } = await deleteConsultationRequest(requestId);
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: t('requestDeleted') });
        await loadRequests();
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('error') });
    } finally {
      setDeleteLoading(null);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.disease_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.phone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'contacted':
        return Phone;
      case 'completed':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return t('pending');
      case 'contacted':
        return t('contacted');
      case 'completed':
        return t('completed');
      case 'cancelled':
        return t('cancelled');
      default:
        return t('unknown');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="theme-text-muted">{t('consultationRequestsLoading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center space-x-2 animate-slide-down ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} className="text-green-600" />
          ) : (
            <AlertCircle size={20} className="text-red-600" />
          )}
          <span className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </span>
        </div>
      )}

      {/* Consultation Requests Table */}
      <div className="theme-bg rounded-lg theme-shadow theme-border border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y theme-border">
            <thead className="theme-bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                  {t('patientTable')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                  {t('disease')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                  {t('phone')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                  {t('statusTable')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                  {t('askedTime')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium theme-text-muted uppercase tracking-wider">
                  {t('actionsTable')}
                </th>
              </tr>
            </thead>
            <tbody className="theme-bg divide-y theme-border">
              {filteredRequests.map((request) => {
                const StatusIcon = getStatusIcon(request.status);
                return (
                  <tr key={request.id} className="hover:theme-bg-tertiary transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User size={16} className="theme-accent" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium theme-text">
                            {request.first_name} {request.last_name}
                          </div>
                          <div className="text-sm theme-text-muted">
                            {request.age} {t('yearsOld')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm theme-text">{request.disease_type}</div>
                      {request.comments && (
                        <div className="text-xs theme-text-muted line-clamp-2 max-w-48">
                          {request.comments}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Phone size={14} className="theme-text-muted" />
                        <a
                          href={`tel:${request.phone}`}
                          className="text-sm theme-accent hover:text-primary-700 transition-colors duration-200"
                        >
                          {request.phone}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <StatusIcon size={16} className={
                          request.status === 'pending' ? 'text-yellow-600' :
                          request.status === 'contacted' ? 'text-blue-600' :
                          request.status === 'completed' ? 'text-green-600' :
                          'text-red-600'
                        } />
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                          {getStatusLabel(request.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-muted">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formatDate(request.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Status Update Dropdown */}
                        <select
                          value={request.status}
                          onChange={(e) => handleStatusUpdate(request.id, e.target.value)}
                          disabled={updateLoading === request.id}
                          className="text-xs px-2 py-1 theme-border border rounded theme-bg theme-text disabled:opacity-50"
                        >
                          <option value="pending">{t('pending')}</option>
                          <option value="contacted">{t('contacted')}</option>
                          <option value="completed">{t('completed')}</option>
                          <option value="cancelled">{t('cancelled')}</option>
                        </select>
                        
                        <a
                          href={`tel:${request.phone}`}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title={t('call')}
                        >
                          <Phone size={16} />
                        </a>

                        <button
                          onClick={() => handleDelete(request.id, `${request.first_name} ${request.last_name}`)}
                          disabled={deleteLoading === request.id}
                          className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                          title={t('deleteAction')}
                        >
                          {deleteLoading === request.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* No Results */}
      {filteredRequests.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="theme-text-muted mb-4">
            <MessageSquare size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold theme-text-secondary mb-2">
            {t('consultationRequestNotFound')}
          </h3>
          <p className="theme-text-muted">
            {t('changeSearchOrFilters')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ConsultationRequestsList;