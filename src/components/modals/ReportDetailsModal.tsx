import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, FileText, CheckCircle, Users, MessageSquare } from 'lucide-react';
import { DOCUMENT_REQUIREMENTS, STAFF_MEMBERS, TODO_ITEMS } from '../../types';

export function ReportDetailsModal({ report, onClose }) {
  const { dispatch } = useApp();
  const [documentVerification, setDocumentVerification] = useState(report.documentVerification || {});
  const [selectedStaff, setSelectedStaff] = useState(report.assignedStaff || []);
  const [selectedTodos, setSelectedTodos] = useState(report.taskAssignment?.todoList || []);
  const [notes, setNotes] = useState(report.taskAssignment?.notes || '');
  const [revisionNotes, setRevisionNotes] = useState('');

  const requiredDocs = DOCUMENT_REQUIREMENTS[report.layanan] || [];
  const allDocsPresent = requiredDocs.every(doc => documentVerification[doc] === 'Ada');

  const handleDocumentChange = (doc, status) => {
    setDocumentVerification(prev => ({
      ...prev,
      [doc]: status
    }));
  };

  const handleStaffChange = (staff, checked) => {
    if (checked) {
      setSelectedStaff([...selectedStaff, staff]);
    } else {
      setSelectedStaff(selectedStaff.filter(s => s !== staff));
    }
  };

  const handleTodoChange = (todo, checked) => {
    if (checked) {
      setSelectedTodos([...selectedTodos, todo]);
    } else {
      setSelectedTodos(selectedTodos.filter(t => t !== todo));
    }
  };

  const handleApprove = () => {
    const updatedWorkflow = [
      ...report.workflow,
      {
        id: `w${Date.now()}`,
        action: 'Disetujui oleh Koordinator',
        user: report.currentHolder || '',
        timestamp: new Date().toISOString(),
        status: 'completed'
      },
      {
        id: `w${Date.now() + 1}`,
        action: 'Dikembalikan ke TU untuk Finalisasi',
        user: 'TU Staff',
        timestamp: new Date().toISOString(),
        status: 'completed'
      }
    ];

    const updatedReport = {
      ...report,
      status: 'Selesai',
      workflow: updatedWorkflow,
      progress: 100
    };

    dispatch({ type: 'UPDATE_REPORT', payload: updatedReport });
    onClose();
    alert('Laporan berhasil disetujui dan diteruskan ke TU!');
  };

  const handleRevision = () => {
    if (!revisionNotes.trim()) {
      alert('Silakan masukkan catatan revisi');
      return;
    }

    const updatedWorkflow = [
      ...report.workflow,
      {
        id: `w${Date.now()}`,
        action: 'Dikembalikan untuk Revisi',
        user: report.currentHolder || '',
        timestamp: new Date().toISOString(),
        status: 'completed'
      }
    ];

    const updatedReport = {
      ...report,
      status: 'Revisi',
      workflow: updatedWorkflow,
      revisionNotes,
      progress: 0
    };

    dispatch({ type: 'UPDATE_REPORT', payload: updatedReport });
    onClose();
    alert('Laporan dikembalikan untuk revisi!');
  };

  const handleAssignTasks = () => {
    if (selectedStaff.length === 0 || selectedTodos.length === 0) {
      alert('Pilih minimal satu staff dan satu tugas');
      return;
    }

    const updatedReport = {
      ...report,
      documentVerification,
      assignedStaff: selectedStaff,
      taskAssignment: {
        assignedStaff: selectedStaff,
        todoList: selectedTodos,
        notes,
        completedTasks: []
      },
      progress: 0,
      workflow: [
        ...report.workflow.slice(0, -1),
        {
          id: `w${Date.now()}`,
          action: 'Ditugaskan kepada Staff',
          user: report.currentHolder || '',
          timestamp: new Date().toISOString(),
          status: 'completed'
        },
        {
          id: `w${Date.now() + 1}`,
          action: 'Sedang dikerjakan Staff',
          user: selectedStaff.join(', '),
          timestamp: new Date().toISOString(),
          status: 'in-progress'
        }
      ]
    };

    dispatch({ type: 'UPDATE_REPORT', payload: updatedReport });
    onClose();
    alert('Tugas berhasil ditugaskan kepada staff!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Detail Laporan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Report Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium">No. Surat:</span> {report.noSurat}</div>
              <div><span className="font-medium">Hal:</span> {report.hal}</div>
              <div><span className="font-medium">Layanan:</span> {report.layanan}</div>
              <div><span className="font-medium">Dari:</span> {report.dari}</div>
            </div>
          </div>

          {/* Document Verification */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Verifikasi Dokumen
            </h3>
            <div className="space-y-2">
              {requiredDocs.map(doc => (
                <div key={doc} className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-700">{doc}</span>
                  <select
                    value={documentVerification[doc] || ''}
                    onChange={(e) => handleDocumentChange(doc, e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Status</option>
                    <option value="Ada">Ada</option>
                    <option value="Tidak Ada">Tidak Ada</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Task Assignment - Only show if all documents are present */}
          {allDocsPresent && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Penugasan Tugas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Pilih Staff:</h4>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {STAFF_MEMBERS.map(staff => (
                      <label key={staff} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedStaff.includes(staff)}
                          onChange={(e) => handleStaffChange(staff, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{staff}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Daftar To-Do:</h4>
                  <div className="space-y-2">
                    {TODO_ITEMS.map(todo => (
                      <label key={todo} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTodos.includes(todo)}
                          onChange={(e) => handleTodoChange(todo, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{todo}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan:
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Tambahkan catatan untuk staff..."
                />
              </div>

              <div className="mt-4">
                <button
                  onClick={handleAssignTasks}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Tugaskan kepada Staff
                </button>
              </div>
            </div>
          )}

          {/* Progress Evaluation - Show if tasks are assigned */}
          {report.progress !== undefined && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Evaluasi Progress
              </h3>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress Penyelesaian:</span>
                  <span className="text-sm font-medium text-gray-900">{report.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${report.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                {report.progress === 100 && (
                  <button
                    onClick={handleApprove}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Setujui & Teruskan ke TU
                  </button>
                )}
                
                <div className="flex-1">
                  <textarea
                    value={revisionNotes}
                    onChange={(e) => setRevisionNotes(e.target.value)}
                    placeholder="Catatan revisi (jika diperlukan)..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={handleRevision}
                    className="mt-2 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Revisi & Kembalikan ke Staff
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}