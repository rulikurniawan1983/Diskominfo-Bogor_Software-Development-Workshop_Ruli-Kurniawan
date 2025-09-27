"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Table, Select, message, Card, DatePicker, Input, Tabs } from "antd";

const { Option } = Select;

export default function AdminDashboard() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState([]); // [startMoment, endMoment]
  const [updatingStatus, setUpdatingStatus] = useState({}); // Track which submission is being updated
  const [refreshing, setRefreshing] = useState(false); // Track refresh loading state
  const [adminData, setAdminData] = useState(null); // Store admin data
  const [activeSubmissionTab, setActiveSubmissionTab] = useState("ALL"); // Track active submission type tab

  useEffect(() => {
    // Check if admin is logged in
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("adminLoggedIn");
      const adminDataStr = localStorage.getItem("adminData");
      console.log("Auth check - isLoggedIn:", isLoggedIn); // Debug log
      
      if (!isLoggedIn) {
        console.log("Not logged in, redirecting to login"); // Debug log
        router.push("/admin/login");
        return;
      }

      // Parse admin data
      if (adminDataStr) {
        try {
          const admin = JSON.parse(adminDataStr);
          setAdminData(admin);
          console.log("Admin data loaded:", admin);
        } catch (error) {
          console.error("Error parsing admin data:", error);
        }
      }

      console.log("Logged in, fetching submissions"); // Debug log
      fetchSubmissions();
    };

    // Add a small delay to ensure localStorage is available
    setTimeout(checkAuth, 100);
  }, [router]);

  const fetchSubmissions = async (showLoading = false) => {
    if (showLoading) {
      setRefreshing(true);
    }

    try {
      // Ultra-aggressive cache bypass
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const forceRefresh = Date.now();
      const cacheBuster = Math.random().toString(36).substring(7);

      const response = await fetch(
        `/api/admin/submissions?t=${timestamp}&r=${random}&force=${forceRefresh}&cb=${cacheBuster}&_=${Date.now()}`,
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
            Pragma: "no-cache",
            "X-Requested-With": "XMLHttpRequest",
            "X-Force-Refresh": "true",
            "X-Cache-Buster": `${timestamp}-${random}`,
            "X-Request-Time": `${Date.now()}`,
          },
          // Force fresh request
          cache: "no-store",
        }
      );
      const data = await response.json();

      if (response.ok) {
        setSubmissions(data);
        if (showLoading) {
          message.success("Data berhasil diperbarui");
        }
      } else {
        message.error("Gagal memuat data pengajuan");
      }
    } catch (error) {
      message.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
      if (showLoading) {
        setRefreshing(false);
      }
    }
  };

  // Simple refresh function
  const handleRefresh = () => {
    fetchSubmissions(true);
  };


  const getStatusText = (status) => {
    switch (status) {
      case "PENGAJUAN_BARU":
        return "Pengajuan Baru";
      case "DIPROSES":
        return "Sedang Diproses";
      case "SELESAI":
        return "Selesai";
      case "DITOLAK":
        return "Ditolak";
      default:
        return status;
    }
  };

  const handleStatusChange = async (submissionId, newStatus) => {
    // Set loading state for this specific submission
    setUpdatingStatus((prev) => ({ ...prev, [submissionId]: true }));

    try {
      const response = await fetch(
        `/api/admin/submissions/${submissionId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        message.success("Status berhasil diupdate");
        // Extended loading state untuk memastikan data ter-update
        // Keep loading for 2.5 seconds to ensure data is fresh
        setTimeout(() => {
          // Force refresh dengan cache bypass yang lebih agresif
          const forceTimestamp = Date.now();
          const forceRandom = Math.random().toString(36).substring(7);
          const forceCacheBuster = Math.random().toString(36).substring(7);

          // Multiple refresh attempts dengan delay yang lebih lama
          fetchSubmissions(true);

          // Additional force refresh after 1.5 seconds
          setTimeout(() => {
            fetch(
              `/api/admin/submissions?force=${forceTimestamp}&r=${forceRandom}&cb=${forceCacheBuster}&_=${Date.now()}`,
              {
                headers: {
                  "Cache-Control":
                    "no-cache, no-store, must-revalidate, max-age=0",
                  "X-Force-Refresh": "true",
                  "X-Cache-Buster": `${forceTimestamp}-${forceRandom}`,
                },
                cache: "no-store",
              }
            ).then(() => {
              // Final refresh
              fetchSubmissions(true);
            });
          }, 1500); // Increased delay to 1.5 seconds
        }, 1000); // Increased initial delay to 1 second
      } else {
        const error = await response.json();
        message.error(error.message || "Gagal mengupdate status");
      }
    } catch (error) {
      message.error("Terjadi kesalahan jaringan");
    } finally {
      // Clear loading state after extended delay to ensure data is fresh
      setTimeout(() => {
        setUpdatingStatus((prev) => ({ ...prev, [submissionId]: false }));
      }, 2500); // Total loading time: 2.5 seconds
    }
  };

  // Derive service options from loaded submissions
  const uniqueServices = Array.from(
    new Set((submissions || []).map((s) => s.jenis_layanan).filter(Boolean))
  );

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminData");
    router.push("/admin/login");
  };

  const columns = [
    {
      title: "Kode Tracking",
      dataIndex: "tracking_code",
      key: "tracking_code",
      render: (text) => (
        <div className="max-w-[120px] sm:max-w-[200px] lg:max-w-[300px]">
          <span
            className="font-mono text-xs sm:text-sm break-all leading-tight"
            title={text}
          >
            {text}
          </span>
        </div>
      ),
      width: 200,
      fixed: "left",
    },
    {
      title: "Nama",
      dataIndex: "nama",
      key: "nama",
      width: 120,
      render: (text) => (
        <div className="max-w-[80px] sm:max-w-[120px]">
          <span
            className="text-xs sm:text-sm break-words leading-tight"
            title={text}
          >
            {text}
          </span>
        </div>
      ),
    },
    {
      title: "Jenis Layanan",
      dataIndex: "jenis_layanan",
      key: "jenis_layanan",
      width: 120,
      render: (text) => (
        <div className="max-w-[80px] sm:max-w-[120px]">
          <span
            className="text-xs sm:text-sm break-words leading-tight"
            title={text}
          >
            {text}
          </span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 180,
      render: (status, record) => (
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
          <Select
            value={status}
            style={{ width: "100%", minWidth: "100px", maxWidth: "150px" }}
            onChange={(value) => handleStatusChange(record.id, value)}
            disabled={updatingStatus[record.id]}
            loading={updatingStatus[record.id]}
            size="small"
          >
            <Option value="PENGAJUAN_BARU">Pengajuan Baru</Option>
            <Option value="DIPROSES">Sedang Diproses</Option>
            <Option value="SELESAI">Selesai</Option>
            <Option value="DITOLAK">Ditolak</Option>
          </Select>
          {updatingStatus[record.id] && (
            <div className="flex items-center text-blue-600 text-xs sm:text-sm">
              <svg
                className="animate-spin h-3 w-3 sm:h-4 sm:w-4 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="hidden sm:inline">Updating...</span>
              <span className="sm:hidden">...</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Dibuat",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      responsive: ["lg"],
      render: (date) => {
        if (!date) return "-";
        try {
          const formattedDate = new Date(date).toLocaleString("id-ID", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <div className="max-w-[100px] sm:max-w-[150px]">
              <span
                className="text-xs sm:text-sm break-words leading-tight"
                title={formattedDate}
              >
                {formattedDate}
              </span>
            </div>
          );
        } catch (error) {
          return "-";
        }
      },
    },
    {
      title: "Diupdate",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 150,
      responsive: ["lg"],
      render: (date) => {
        if (!date) return "-";
        try {
          const formattedDate = new Date(date).toLocaleString("id-ID", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <div className="max-w-[100px] sm:max-w-[150px]">
              <span
                className="text-xs sm:text-sm break-words leading-tight"
                title={formattedDate}
              >
                {formattedDate}
              </span>
            </div>
          );
        } catch (error) {
          return "-";
        }
      },
    },
  ];

  const filteredSubmissions = (submissions || [])
    // Submission type tab filter
    .filter((sub) => (activeSubmissionTab === "ALL" ? true : sub.jenis_layanan === activeSubmissionTab))
    // Status filter
    .filter((sub) => (statusFilter === "ALL" ? true : sub.status === statusFilter))
    // Service filter
    .filter((sub) => (serviceFilter === "ALL" ? true : sub.jenis_layanan === serviceFilter))
    // Date range filter (created_at within range)
    .filter((sub) => {
      if (!dateRange || dateRange.length !== 2 || !dateRange[0] || !dateRange[1]) return true;
      try {
        const created = new Date(sub.created_at).getTime();
        const start = dateRange[0].startOf("day").valueOf();
        const end = dateRange[1].endOf("day").valueOf();
        return created >= start && created <= end;
      } catch (_) {
        return true;
      }
    })
    // Text search filter (tracking_code, nama, email, nik)
    .filter((sub) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (sub.tracking_code || "").toLowerCase().includes(q) ||
        (sub.nama || "").toLowerCase().includes(q) ||
        (sub.email || "").toLowerCase().includes(q) ||
        (sub.nik || "").toLowerCase().includes(q)
      );
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {loading
                  ? "Memuat data pengajuan..."
                  : "Kelola pengajuan layanan masyarakat"}
              </p>
              {adminData && (
                <div className="mt-2 text-xs sm:text-sm text-blue-600">
                  <span className="font-medium">Masuk sebagai: {adminData.email}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center text-sm sm:text-base mr-2"
              >
                {refreshing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Refreshing...
                  </>
                ) : loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  "Refresh"
                )}
              </button>

              {/* Force Refresh Button - Hidden for production */}
              {/* <button
                 onClick={() => {
                   // Force hard refresh
                   window.location.reload();
                 }}
                 disabled={refreshing || loading}
                 className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center text-sm sm:text-base mr-2"
                 title="Force hard refresh untuk bypass semua cache"
               >
                 <svg
                   className="w-4 h-4 mr-1"
                   fill="none"
                   stroke="currentColor"
                   viewBox="0 0 24 24"
                 >
                   <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                   />
                 </svg>
                 Force Refresh
               </button> */}

              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Debug Info - Hidden for production */}
        {/* <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
           <div className="flex items-center">
             <svg
               className="w-5 h-5 text-yellow-600 mr-2"
               fill="none"
               stroke="currentColor"
               viewBox="0 0 24 24"
             >
               <path
                 strokeLinecap="round"
                 strokeLinejoin="round"
                 strokeWidth={2}
                 d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
               />
             </svg>
             <div className="text-sm text-yellow-800">
               <strong>Cache Bypass Active:</strong> Data akan auto-refresh
               setelah status update. Loading state extended untuk memastikan
               data fresh.
             </div>
           </div>
         </div> */}



        {/* Submission Type Tabs */}
        <Card title="Jenis Pengajuan" className="mb-6 sm:mb-8">
          <Tabs
            activeKey={activeSubmissionTab}
            onChange={setActiveSubmissionTab}
            items={[
              {
                key: "ALL",
                label: (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Semua ({submissions.length})
                  </span>
                ),
                children: null,
              },
              {
                key: "KLINIK_HEWAN",
                label: (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Klinik Hewan ({submissions.filter(s => s.jenis_layanan === "KLINIK_HEWAN").length})
                  </span>
                ),
                children: null,
              },
              {
                key: "REKOMENDASI_DOKTER_HEWAN",
                label: (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Rekomendasi Dokter Hewan ({submissions.filter(s => s.jenis_layanan === "REKOMENDASI_DOKTER_HEWAN").length})
                  </span>
                ),
                children: null,
              },
              {
                key: "NOMOR_KONTROL_VETERINER",
                label: (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Nomor Kontrol Veteriner ({submissions.filter(s => s.jenis_layanan === "NOMOR_KONTROL_VETERINER").length})
                  </span>
                ),
                children: null,
              },
            ]}
          />
        </Card>

        {/* Table */}
        <Card title={`Daftar Pengajuan - ${activeSubmissionTab === "ALL" ? "Semua" : activeSubmissionTab === "KLINIK_HEWAN" ? "Klinik Hewan" : activeSubmissionTab === "REKOMENDASI_DOKTER_HEWAN" ? "Rekomendasi Dokter Hewan" : activeSubmissionTab === "NOMOR_KONTROL_VETERINER" ? "Nomor Kontrol Veteriner" : activeSubmissionTab} (${filteredSubmissions.length})`}>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: "100%" }}
                placeholder="Filter status"
                disabled={loading || Object.values(updatingStatus).some(Boolean)}
                loading={loading}
              >
                <Option value="ALL">Semua Status</Option>
                <Option value="PENGAJUAN_BARU">Pengajuan Baru</Option>
                <Option value="DIPROSES">Sedang Diproses</Option>
                <Option value="SELESAI">Selesai</Option>
                <Option value="DITOLAK">Ditolak</Option>
              </Select>
            </div>
            <div>
              <Select
                value={serviceFilter}
                onChange={setServiceFilter}
                style={{ width: "100%" }}
                placeholder="Filter layanan"
                allowClear={false}
                disabled={loading}
              >
                <Option value="ALL">Semua Layanan</Option>
                {uniqueServices.map((svc) => (
                  <Option key={svc} value={svc}>{svc}</Option>
                ))}
              </Select>
            </div>
            <div>
              <DatePicker.RangePicker
                style={{ width: "100%" }}
                value={dateRange}
                onChange={setDateRange}
                allowEmpty={[true, true]}
              />
            </div>
            <div>
              <Input.Search
                placeholder="Cari tracking/nama/email/NIK"
                allowClear
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {loading && (
            <div className="-mt-2 mb-2 text-xs sm:text-sm text-gray-500">Memuat data...</div>
          )}

          <div className="relative">
            <Table
              columns={columns}
              dataSource={filteredSubmissions}
              rowKey="id"
              loading={loading}
              scroll={{ x: 800, y: 400 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showQuickJumper: false,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} dari ${total} pengajuan`,
                size: "small",
                responsive: true,
              }}
              size="small"
              className="responsive-table"
              bordered={false}
              tableLayout="fixed"
            />

            {/* Loading overlay when any status is being updated */}
            {Object.values(updatingStatus).some(Boolean) && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="text-center">
                  <svg
                    className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="text-blue-600 font-medium text-sm sm:text-base">
                    Memperbarui status...
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Custom CSS for responsive table */}
      <style jsx global>{`
        .responsive-table .ant-table {
          overflow-x: auto;
        }

        .responsive-table .ant-table-thead > tr > th,
        .responsive-table .ant-table-tbody > tr > td {
          padding: 8px 12px;
          word-wrap: break-word;
          word-break: break-word;
        }

        .responsive-table .ant-table-thead > tr > th {
          background-color: #fafafa;
          font-weight: 600;
          color: #262626;
        }

        .responsive-table .ant-table-tbody > tr:hover > td {
          background-color: #f5f5f5;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .responsive-table .ant-table {
            font-size: 11px;
          }

          .responsive-table .ant-table-thead > tr > th,
          .responsive-table .ant-table-tbody > tr > td {
            padding: 4px 6px;
            font-size: 10px;
          }

          .responsive-table .ant-table-pagination {
            font-size: 11px;
          }

          .responsive-table .ant-table-scroll {
            overflow-x: auto;
          }

          /* Ensure tracking code doesn't overflow */
          .responsive-table .ant-table-tbody > tr > td:first-child {
            max-width: 80px;
            min-width: 80px;
          }

          /* Compact status column */
          .responsive-table .ant-table-tbody > tr > td:nth-child(4) {
            max-width: 140px;
            min-width: 140px;
          }

          /* Compact nama and jenis layanan columns */
          .responsive-table .ant-table-tbody > tr > td:nth-child(2),
          .responsive-table .ant-table-tbody > tr > td:nth-child(3) {
            max-width: 80px;
            min-width: 80px;
          }
        }

        /* Small mobile devices */
        @media (max-width: 480px) {
          .responsive-table .ant-table-thead > tr > th,
          .responsive-table .ant-table-tbody > tr > td {
            padding: 2px 4px;
            font-size: 9px;
          }

          .responsive-table .ant-table-tbody > tr > td:first-child {
            max-width: 70px;
            min-width: 70px;
          }

          .responsive-table .ant-table-tbody > tr > td:nth-child(2),
          .responsive-table .ant-table-tbody > tr > td:nth-child(3) {
            max-width: 70px;
            min-width: 70px;
          }

          .responsive-table .ant-table-tbody > tr > td:nth-child(4) {
            max-width: 120px;
            min-width: 120px;
          }
        }
      `}</style>
    </div>
  );
}
