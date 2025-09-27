"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ApplicantDashboard() {
  const [applicantData, setApplicantData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get applicant data from localStorage or session
    const savedData = localStorage.getItem('applicantData');
    if (savedData) {
      setApplicantData(JSON.parse(savedData));
    }
    setLoading(false);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENGAJUAN_BARU':
        return 'bg-blue-100 text-blue-800';
      case 'DIPROSES':
        return 'bg-yellow-100 text-yellow-800';
      case 'SELESAI':
        return 'bg-green-100 text-green-800';
      case 'DITOLAK':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENGAJUAN_BARU':
        return 'Pengajuan Baru';
      case 'DIPROSES':
        return 'Sedang Diproses';
      case 'SELESAI':
        return 'Selesai';
      case 'DITOLAK':
        return 'Ditolak';
      default:
        return status;
    }
  };

  const getServiceTypeText = (type) => {
    switch (type) {
      case 'KLINIK_HEWAN':
        return 'Klinik Hewan';
      case 'REKOMENDASI_DOKTER_HEWAN':
        return 'Rekomendasi Praktek Dokter Hewan';
      case 'NOMOR_KONTROL_VETERINER':
        return 'Nomor Kontrol Veteriner';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!applicantData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Data</h2>
            <p className="text-gray-600 mb-6">Anda belum memiliki pengajuan. Silakan buat pengajuan baru.</p>
          </div>
          
          <Link
            href="/public"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Buat Pengajuan Baru
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Pemohon</h1>
              <p className="text-gray-600 mt-1">Kelola pengajuan layanan Anda</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/public"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Pengajuan Baru
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{applicantData.nama}</h3>
                <p className="text-gray-600">{applicantData.email}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">NIK</label>
                  <p className="text-gray-900">{applicantData.nik}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">No. WhatsApp</label>
                  <p className="text-gray-900">{applicantData.no_wa}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Terdaftar Sejak</label>
                  <p className="text-gray-900">{new Date(applicantData.created_at || Date.now()).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submissions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Riwayat Pengajuan</h3>
                <p className="text-gray-600 mt-1">Daftar semua pengajuan layanan Anda</p>
              </div>

              <div className="p-6">
                {submissions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Pengajuan</h4>
                    <p className="text-gray-600 mb-6">Anda belum memiliki pengajuan layanan.</p>
                    <Link
                      href="/public"
                      className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Buat Pengajuan Pertama
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition duration-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-gray-900">
                                {getServiceTypeText(submission.jenis_layanan)}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                                {getStatusText(submission.status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Kode Tracking: <span className="font-mono font-medium">{submission.tracking_code}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Dibuat: {new Date(submission.created_at).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="mt-3 sm:mt-0 sm:ml-4">
                            <Link
                              href={`/public/status?tracking_code=${submission.tracking_code}`}
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                              Lihat Detail
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/public"
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition duration-200 group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition duration-200">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Pengajuan Baru</h3>
                <p className="text-sm text-gray-600">Buat pengajuan layanan baru</p>
              </div>
            </div>
          </Link>

          <Link
            href="/public/status"
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition duration-200 group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition duration-200">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Cek Status</h3>
                <p className="text-sm text-gray-600">Periksa status pengajuan</p>
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition duration-200 group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition duration-200">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Beranda</h3>
                <p className="text-sm text-gray-600">Kembali ke halaman utama</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
