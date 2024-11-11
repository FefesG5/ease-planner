import { useState, ChangeEvent, useRef } from "react";
import withDashboardLayout from "@/hoc/withDashboardLayout";

function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [signedUrl, setSignedUrl] = useState<string>("");
  const [copyMessage, setCopyMessage] = useState<string>("");

  const [fileType, setFileType] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a file to upload.");
      return;
    }

    if (!fileType) {
      setMessage("Please select a file type.");
      return;
    }

    if (!month || !year) {
      setMessage("Please select a month and a year.");
      return;
    }

    setUploading(true);
    setMessage("");
    setSignedUrl("");
    setCopyMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("fileType", fileType);
    formData.append("month", month);
    formData.append("year", year);

    try {
      const response = await fetch("/api/uploads/uploadFile", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("File uploaded successfully!");
        setSignedUrl(data.signedUrl);

        setSelectedFile(null);
        setMonth("");
        setYear("");

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setMessage("Failed to upload file. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(
        "Error uploading file. Please check your network connection and try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = () => {
    if (signedUrl) {
      navigator.clipboard.writeText(signedUrl);
      setCopyMessage("Signed URL copied to clipboard!");
      setTimeout(() => {
        setCopyMessage("");
      }, 3000);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6 shadow-md mt-0 bg-[var(--user-section-bg-color)]">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center text-[color:var(--body-text-color)]">
        Upload Files
      </h1>
      <p className="mb-4 text-sm sm:text-base text-center text-[color:var(--body-text-color)]">
        Upload the files to get started with schedule generation.
      </p>

      <div className="flex flex-col items-center mb-4 w-full">
        <div
          className={`w-full text-sm py-2 px-4 font-semibold text-center cursor-pointer ${
            uploading
              ? "bg-[var(--sidebar-border-color)] text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          onClick={!uploading ? triggerFileInput : undefined}
        >
          {selectedFile ? selectedFile.name : "Choose File (No file chosen)"}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="w-full mt-4 p-2 rounded-md text-[color:var(--body-text-color)] bg-[var(--signin-input-bg-color)] border-[var(--signin-input-border-color)] cursor-pointer"
          disabled={uploading}
        >
          <option value="" disabled>
            Select File Type
          </option>
          <option value="shukkimboTemplate">Shukkimbo Template</option>
          <option value="workingSchedule">Working Schedule</option>
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full mt-4 p-2 rounded-md text-[color:var(--body-text-color)] bg-[var(--signin-input-bg-color)] border-[var(--signin-input-border-color)] cursor-pointer"
          disabled={uploading}
        >
          <option value="">Select Month</option>
          {[
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ].map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full mt-4 p-2 rounded-md text-[color:var(--body-text-color)] bg-[var(--signin-input-bg-color)] border-[var(--signin-input-border-color)] cursor-pointer"
          disabled={uploading}
        >
          <option value="">Select Year</option>
          {[2024, 2025].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleUpload}
        disabled={uploading}
        className={`w-full py-2 px-4 rounded-md text-white transition-all duration-200 cursor-pointer ${
          uploading
            ? "bg-[var(--sidebar-border-color)] cursor-not-allowed"
            : "bg-[var(--signin-btn-bg-color)] hover:bg-blue-600"
        }`}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {message && (
        <div className="mt-4 h-20 w-full flex items-center justify-center transition-all duration-300">
          <div className="p-3 text-center text-sm sm:text-base bg-[var(--signin-container-bg-color)] text-[color:var(--body-text-color)]">
            {message}
          </div>
        </div>
      )}

      {signedUrl && (
        <div className="mt-4 p-4 border w-full bg-[var(--user-section-bg-color)] border-[var(--sidebar-border-color)] rounded-md">
          <p className="mb-2 text-sm sm:text-base text-center text-[color:var(--body-text-color)]">
            Your file is ready!
          </p>
          <div className="flex flex-col items-center w-full">
            {/* Alias for the URL with full copy button */}
            <div className="flex items-center justify-between w-full p-2 bg-[var(--signin-input-bg-color)] rounded-md">
              <p className="text-xs sm:text-sm text-[color:var(--body-text-color)]">
                File Link - Click Copy
              </p>
              <button
                onClick={handleCopyUrl}
                className="py-1 px-3 text-xs font-medium text-white rounded-md bg-[var(--signin-btn-bg-color)] hover:bg-blue-600"
              >
                Copy
              </button>
            </div>
            {copyMessage && (
              <p className="mt-2 text-xs sm:text-sm text-center text-[color:var(--body-text-color)]">
                {copyMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default withDashboardLayout(Upload);
