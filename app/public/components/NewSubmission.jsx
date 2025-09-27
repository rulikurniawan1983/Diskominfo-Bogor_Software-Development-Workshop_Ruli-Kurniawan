"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Phone number formatting function
const formatPhoneNumber = (phone) => {
  if (!phone) return "";

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // Remove leading zeros
  cleaned = cleaned.replace(/^0+/, "");

  // If it starts with 62, it's already in international format
  if (cleaned.startsWith("62")) {
    return `+${cleaned}`;
  }

  // For Indonesian mobile numbers, add 62
  if (cleaned.length >= 8 && cleaned.length <= 13) {
    return `+62${cleaned}`;
  }

  // Default: assume it's a mobile number and add 62
  return `+62${cleaned}`;
};

export default function NewSubmission() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama: "",
    nik: "",
    email: "",
    no_wa: "",
    jenis_layanan: "",
    consent: false,
    file_upload: null,
    nama_hewan: "",
    jenis_hewan: "",
    jenis_kelamin_hewan: "",
    umur_hewan: "",
    keluhan: "",
    surat_permohonan: null,
    ktp: null,
    pas_foto: null,
    ijazah_dokter_hewan: null,
    sertifikat_kompetensi: null,
    surat_rekomendasi: null,
    surat_permohonan_kontrol: null,
    data_umum_khusus: null,
    sop_pembersihan: null,
    surat_pernyataan: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nama.trim()) {
      newErrors.nama = "Nama wajib diisi";
    }

    if (!formData.nik.trim()) {
      newErrors.nik = "NIK wajib diisi";
    } else if (formData.nik.length !== 16) {
      newErrors.nik = "NIK harus 16 digit";
    } else if (!/^\d+$/.test(formData.nik)) {
      newErrors.nik = "NIK hanya boleh berisi angka";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.no_wa.trim()) {
      newErrors.no_wa = "Nomor WhatsApp wajib diisi";
    } else {
      // Allow common phone formats: 08xxxx, 8xxxx, +628xxxx, etc.
      const phoneRegex = /^(\+?62|0)?[0-9]{8,13}$/;
      if (!phoneRegex.test(formData.no_wa.trim())) {
        newErrors.no_wa = "Format nomor WhatsApp tidak valid. Gunakan 08xxxxxxxxxx atau +628xxxxxxxxxx";
      }
    }

    if (!formData.jenis_layanan) {
      newErrors.jenis_layanan = "Jenis layanan wajib dipilih";
    }

    // Animal data validation for Klinik Hewan
    if (formData.jenis_layanan === "KLINIK_HEWAN") {
      if (!formData.nama_hewan.trim()) {
        newErrors.nama_hewan = "Nama hewan wajib diisi";
      }
      
      if (!formData.jenis_hewan) {
        newErrors.jenis_hewan = "Jenis hewan wajib dipilih";
      }
      
      if (!formData.jenis_kelamin_hewan) {
        newErrors.jenis_kelamin_hewan = "Jenis kelamin hewan wajib dipilih";
      }
      
      if (!formData.umur_hewan.trim()) {
        newErrors.umur_hewan = "Umur hewan wajib diisi";
      }
      
      if (!formData.keluhan.trim()) {
        newErrors.keluhan = "Keluhan wajib diisi";
      }
    }

    // Document upload validation for Rekomendasi Praktek Dokter Hewan
    if (formData.jenis_layanan === "REKOMENDASI_DOKTER_HEWAN") {
      if (!formData.surat_permohonan) {
        newErrors.surat_permohonan = "Surat Permohonan wajib diupload";
      }
      
      if (!formData.ktp) {
        newErrors.ktp = "Fotokopi KTP wajib diupload";
      }
      
      if (!formData.pas_foto) {
        newErrors.pas_foto = "Pas Foto wajib diupload";
      }
      
      if (!formData.ijazah_dokter_hewan) {
        newErrors.ijazah_dokter_hewan = "Ijazah Dokter Hewan wajib diupload";
      }
      
      if (!formData.sertifikat_kompetensi) {
        newErrors.sertifikat_kompetensi = "Sertifikat Kompetensi wajib diupload";
      }
      
      if (!formData.surat_rekomendasi) {
        newErrors.surat_rekomendasi = "Surat Rekomendasi wajib diupload";
      }
    }

    // Document upload validation for Nomor Kontrol Veteriner
    if (formData.jenis_layanan === "NOMOR_KONTROL_VETERINER") {
      if (!formData.surat_permohonan_kontrol) {
        newErrors.surat_permohonan_kontrol = "Surat Permohonan wajib diupload";
      }
      
      if (!formData.data_umum_khusus) {
        newErrors.data_umum_khusus = "Data Umum dan Data Khusus wajib diupload";
      }
      
      if (!formData.sop_pembersihan) {
        newErrors.sop_pembersihan = "SOP Pembersihan dan Sanitasi wajib diupload";
      }
      
      if (!formData.surat_pernyataan) {
        newErrors.surat_pernyataan = "Surat Pernyataan Kebenaran Dokumen wajib diupload";
      }
    }

    if (!formData.consent) {
      newErrors.consent = "Anda harus menyetujui pemberian notifikasi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Format phone number to +62 format before sending
      const formattedData = {
        ...formData,
        no_wa: formatPhoneNumber(formData.no_wa),
      };

      // Use FormData if documents are uploaded, otherwise use JSON
      let requestBody;
      let headers = {};

      if ((formData.jenis_layanan === "REKOMENDASI_DOKTER_HEWAN" && 
          (formattedData.surat_permohonan || formattedData.ktp || formattedData.pas_foto || 
           formattedData.ijazah_dokter_hewan || formattedData.sertifikat_kompetensi || 
           formattedData.surat_rekomendasi)) ||
          (formData.jenis_layanan === "NOMOR_KONTROL_VETERINER" && 
          (formattedData.surat_permohonan_kontrol || formattedData.data_umum_khusus || 
           formattedData.sop_pembersihan || formattedData.surat_pernyataan))) {
        const formData = new FormData();
        formData.append('nama', formattedData.nama);
        formData.append('nik', formattedData.nik);
        formData.append('email', formattedData.email);
        formData.append('no_wa', formattedData.no_wa);
        formData.append('jenis_layanan', formattedData.jenis_layanan);
        formData.append('consent', formattedData.consent);
        
        // Append document files for Rekomendasi Praktek Dokter Hewan
        if (formattedData.surat_permohonan) formData.append('surat_permohonan', formattedData.surat_permohonan);
        if (formattedData.ktp) formData.append('ktp', formattedData.ktp);
        if (formattedData.pas_foto) formData.append('pas_foto', formattedData.pas_foto);
        if (formattedData.ijazah_dokter_hewan) formData.append('ijazah_dokter_hewan', formattedData.ijazah_dokter_hewan);
        if (formattedData.sertifikat_kompetensi) formData.append('sertifikat_kompetensi', formattedData.sertifikat_kompetensi);
        if (formattedData.surat_rekomendasi) formData.append('surat_rekomendasi', formattedData.surat_rekomendasi);
        
        // Append document files for Nomor Kontrol Veteriner
        if (formattedData.surat_permohonan_kontrol) formData.append('surat_permohonan_kontrol', formattedData.surat_permohonan_kontrol);
        if (formattedData.data_umum_khusus) formData.append('data_umum_khusus', formattedData.data_umum_khusus);
        if (formattedData.sop_pembersihan) formData.append('sop_pembersihan', formattedData.sop_pembersihan);
        if (formattedData.surat_pernyataan) formData.append('surat_pernyataan', formattedData.surat_pernyataan);
        
        requestBody = formData;
      } else {
        headers['Content-Type'] = 'application/json';
        requestBody = JSON.stringify(formattedData);
      }

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers,
        body: requestBody,
      });

      const result = await response.json();

      if (response.ok) {
        // Redirect to success page with tracking code
        router.push(`/public/success?tracking_code=${result.tracking_code}`);
      } else {
        setErrors({
          submit: result.message || "Terjadi kesalahan saat mengirim pengajuan",
        });
      }
    } catch (error) {
      setErrors({ submit: "Terjadi kesalahan jaringan" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Form Pengajuan Layanan
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nama */}
        <div>
          <label
            htmlFor="nama"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nama Lengkap *
          </label>
          <input
            type="text"
            id="nama"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${
              errors.nama ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Masukkan nama lengkap"
          />
          {errors.nama && (
            <p className="mt-1 text-sm text-red-600">{errors.nama}</p>
          )}
        </div>

        {/* NIK */}
        <div>
          <label
            htmlFor="nik"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            NIK (16 digit) *
          </label>
          <input
            type="text"
            id="nik"
            name="nik"
            value={formData.nik}
            onChange={handleChange}
            maxLength={16}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${
              errors.nik ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Masukkan 16 digit NIK"
          />
          {errors.nik && (
            <p className="mt-1 text-sm text-red-600">{errors.nik}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="contoh@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* WhatsApp */}
        <div>
          <label
            htmlFor="no_wa"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nomor WhatsApp *
          </label>
          <input
            type="tel"
            id="no_wa"
            name="no_wa"
            value={formData.no_wa}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${
              errors.no_wa ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="08xxxxxxxxxx (akan diformat ke +62...)"
          />
          {errors.no_wa && (
            <p className="mt-1 text-sm text-red-600">{errors.no_wa}</p>
          )}
        </div>

        {/* Jenis Layanan */}
        <div>
          <label
            htmlFor="jenis_layanan"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Jenis Layanan *
          </label>
          <select
            id="jenis_layanan"
            name="jenis_layanan"
            value={formData.jenis_layanan}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${
              errors.jenis_layanan ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Pilih jenis layanan</option>
            <option value="KLINIK_HEWAN">Klinik Hewan</option>
            <option value="REKOMENDASI_DOKTER_HEWAN">Rekomendasi Praktek Dokter Hewan</option>
            <option value="NOMOR_KONTROL_VETERINER">Nomor Kontrol Veteriner</option>
          </select>
          {errors.jenis_layanan && (
            <p className="mt-1 text-sm text-red-600">{errors.jenis_layanan}</p>
          )}
        </div>

        {/* Data Hewan - Only for Klinik Hewan */}
        {formData.jenis_layanan === "KLINIK_HEWAN" && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Data Hewan</h3>
            
            {/* Nama Hewan */}
            <div>
              <label
                htmlFor="nama_hewan"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nama Hewan *
              </label>
              <input
                type="text"
                id="nama_hewan"
                name="nama_hewan"
                value={formData.nama_hewan}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${
                  errors.nama_hewan ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Masukkan nama hewan"
              />
              {errors.nama_hewan && (
                <p className="mt-1 text-sm text-red-600">{errors.nama_hewan}</p>
              )}
            </div>

            {/* Jenis Hewan */}
            <div>
              <label
                htmlFor="jenis_hewan"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Jenis Hewan *
              </label>
              <select
                id="jenis_hewan"
                name="jenis_hewan"
                value={formData.jenis_hewan}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${
                  errors.jenis_hewan ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Pilih jenis hewan</option>
                <option value="ANJING">Anjing</option>
                <option value="KUCING">Kucing</option>
                <option value="BURUNG">Burung</option>
                <option value="KELINCI">Kelinci</option>
                <option value="HAMSTER">Hamster</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
              {errors.jenis_hewan && (
                <p className="mt-1 text-sm text-red-600">{errors.jenis_hewan}</p>
              )}
            </div>

            {/* Jenis Kelamin Hewan */}
            <div>
              <label
                htmlFor="jenis_kelamin_hewan"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Jenis Kelamin Hewan *
              </label>
              <select
                id="jenis_kelamin_hewan"
                name="jenis_kelamin_hewan"
                value={formData.jenis_kelamin_hewan}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${
                  errors.jenis_kelamin_hewan ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Pilih jenis kelamin</option>
                <option value="JANTAN">Jantan</option>
                <option value="BETINA">Betina</option>
              </select>
              {errors.jenis_kelamin_hewan && (
                <p className="mt-1 text-sm text-red-600">{errors.jenis_kelamin_hewan}</p>
              )}
            </div>

            {/* Umur Hewan */}
            <div>
              <label
                htmlFor="umur_hewan"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Umur Hewan *
              </label>
              <input
                type="text"
                id="umur_hewan"
                name="umur_hewan"
                value={formData.umur_hewan}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${
                  errors.umur_hewan ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Contoh: 2 tahun, 6 bulan, 1.5 tahun"
              />
              {errors.umur_hewan && (
                <p className="mt-1 text-sm text-red-600">{errors.umur_hewan}</p>
              )}
            </div>

            {/* Keluhan */}
            <div>
              <label
                htmlFor="keluhan"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Keluhan *
              </label>
              <textarea
                id="keluhan"
                name="keluhan"
                value={formData.keluhan}
                onChange={handleChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${
                  errors.keluhan ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Jelaskan keluhan atau gejala yang dialami hewan"
              />
              {errors.keluhan && (
                <p className="mt-1 text-sm text-red-600">{errors.keluhan}</p>
              )}
            </div>
          </div>
        )}

        {/* Upload Dokumen - Only for Rekomendasi Praktek Dokter Hewan */}
        {formData.jenis_layanan === "REKOMENDASI_DOKTER_HEWAN" && (
          <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Upload Dokumen Persyaratan</h3>
            <p className="text-sm text-green-700 mb-4">
              Silakan upload dokumen-dokumen berikut dalam format PDF (maksimal 5MB per file):
            </p>
            
            {/* Surat Permohonan */}
            <div>
              <label
                htmlFor="surat_permohonan"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Surat Permohonan *
              </label>
              <input
                type="file"
                id="surat_permohonan"
                name="surat_permohonan"
                onChange={handleChange}
                accept=".pdf"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black ${
                  errors.surat_permohonan ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.surat_permohonan && (
                <p className="mt-1 text-sm text-red-600">{errors.surat_permohonan}</p>
              )}
            </div>

            {/* Fotokopi KTP */}
            <div>
              <label
                htmlFor="ktp"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Fotokopi Kartu Tanda Penduduk *
              </label>
              <input
                type="file"
                id="ktp"
                name="ktp"
                onChange={handleChange}
                accept=".pdf"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black ${
                  errors.ktp ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.ktp && (
                <p className="mt-1 text-sm text-red-600">{errors.ktp}</p>
              )}
            </div>

            {/* Pas Foto */}
            <div>
              <label
                htmlFor="pas_foto"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Pas Foto Berwarna Ukuran 4x6 cm *
              </label>
              <input
                type="file"
                id="pas_foto"
                name="pas_foto"
                onChange={handleChange}
                accept=".pdf"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black ${
                  errors.pas_foto ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.pas_foto && (
                <p className="mt-1 text-sm text-red-600">{errors.pas_foto}</p>
              )}
            </div>

            {/* Ijazah Dokter Hewan */}
            <div>
              <label
                htmlFor="ijazah_dokter_hewan"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Fotokopi Ijazah Dokter Hewan *
              </label>
              <input
                type="file"
                id="ijazah_dokter_hewan"
                name="ijazah_dokter_hewan"
                onChange={handleChange}
                accept=".pdf"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black ${
                  errors.ijazah_dokter_hewan ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.ijazah_dokter_hewan && (
                <p className="mt-1 text-sm text-red-600">{errors.ijazah_dokter_hewan}</p>
              )}
            </div>

            {/* Sertifikat Kompetensi */}
            <div>
              <label
                htmlFor="sertifikat_kompetensi"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Fotokopi Sertifikat Kompetensi Dokter Hewan *
              </label>
              <input
                type="file"
                id="sertifikat_kompetensi"
                name="sertifikat_kompetensi"
                onChange={handleChange}
                accept=".pdf"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black ${
                  errors.sertifikat_kompetensi ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.sertifikat_kompetensi && (
                <p className="mt-1 text-sm text-red-600">{errors.sertifikat_kompetensi}</p>
              )}
            </div>

            {/* Surat Rekomendasi */}
            <div>
              <label
                htmlFor="surat_rekomendasi"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Fotokopi Surat Rekomendasi Dari Organisasi Profesi Kedokteran Hewan *
              </label>
              <input
                type="file"
                id="surat_rekomendasi"
                name="surat_rekomendasi"
                onChange={handleChange}
                accept=".pdf"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black ${
                  errors.surat_rekomendasi ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.surat_rekomendasi && (
                <p className="mt-1 text-sm text-red-600">{errors.surat_rekomendasi}</p>
              )}
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Catatan:</strong> Semua dokumen harus dalam format PDF dan maksimal 5MB per file. 
                Pastikan kualitas scan dokumen jelas dan mudah dibaca.
              </p>
            </div>
          </div>
        )}

        {/* Upload Dokumen - Only for Nomor Kontrol Veteriner */}
        {formData.jenis_layanan === "NOMOR_KONTROL_VETERINER" && (
          <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">Upload Dokumen Persyaratan</h3>
            <p className="text-sm text-purple-700 mb-4">
              Silakan upload dokumen-dokumen berikut dalam format PDF (maksimal 5MB per file):
            </p>
            
            {/* Surat Permohonan */}
            <div>
              <label
                htmlFor="surat_permohonan_kontrol"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Surat Permohonan *
              </label>
              <input
                type="file"
                id="surat_permohonan_kontrol"
                name="surat_permohonan_kontrol"
                onChange={handleChange}
                accept=".pdf"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black ${
                  errors.surat_permohonan_kontrol ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.surat_permohonan_kontrol && (
                <p className="mt-1 text-sm text-red-600">{errors.surat_permohonan_kontrol}</p>
              )}
            </div>

            {/* Data Umum dan Data Khusus */}
            <div>
              <label
                htmlFor="data_umum_khusus"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Data Umum dan Data Khusus *
              </label>
              <input
                type="file"
                id="data_umum_khusus"
                name="data_umum_khusus"
                onChange={handleChange}
                accept=".pdf"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black ${
                  errors.data_umum_khusus ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.data_umum_khusus && (
                <p className="mt-1 text-sm text-red-600">{errors.data_umum_khusus}</p>
              )}
            </div>

            {/* SOP Pembersihan dan Sanitasi */}
            <div>
              <label
                htmlFor="sop_pembersihan"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                SOP Pembersihan dan Sanitasi *
              </label>
              <input
                type="file"
                id="sop_pembersihan"
                name="sop_pembersihan"
                onChange={handleChange}
                accept=".pdf"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black ${
                  errors.sop_pembersihan ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.sop_pembersihan && (
                <p className="mt-1 text-sm text-red-600">{errors.sop_pembersihan}</p>
              )}
            </div>

            {/* Surat Pernyataan Kebenaran Dokumen */}
            <div>
              <label
                htmlFor="surat_pernyataan"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Surat Pernyataan Kebenaran Dokumen *
              </label>
              <input
                type="file"
                id="surat_pernyataan"
                name="surat_pernyataan"
                onChange={handleChange}
                accept=".pdf"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black ${
                  errors.surat_pernyataan ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.surat_pernyataan && (
                <p className="mt-1 text-sm text-red-600">{errors.surat_pernyataan}</p>
              )}
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Catatan:</strong> Semua dokumen harus dalam format PDF dan maksimal 5MB per file. 
                Pastikan kualitas scan dokumen jelas dan mudah dibaca.
              </p>
            </div>
          </div>
        )}

        {/* Consent */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              checked={formData.consent}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="consent" className="text-gray-700">
              Saya setuju untuk menerima notifikasi status pengajuan melalui
              WhatsApp dan email
            </label>
            {errors.consent && (
              <p className="mt-1 text-red-600">{errors.consent}</p>
            )}
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
        >
          {isSubmitting ? "Mengirim..." : "Kirim Pengajuan"}
        </button>
      </form>
    </div>
  );
}
