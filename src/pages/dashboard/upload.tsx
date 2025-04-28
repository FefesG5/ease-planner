import { useState, ChangeEvent, useRef } from "react";
import withDashboardLayout from "@/hoc/withDashboardLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import MonthYearSelect from "@/components/MonthYearSelect/MonthYearSelect";

function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [signedUrl, setSignedUrl] = useState<string>("");
  const [copyMessage, setCopyMessage] = useState<string>("");

  const [fileType, setFileType] = useState<string>("");
  const [month, setMonth] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthContext();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
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

    // Set uploading state, clear messages
    setUploading(true);
    setMessage("");
    setSignedUrl("");
    setCopyMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("fileType", fileType);
    formData.append("month", month.toString());
    formData.append("year", year.toString());

    try {
      if (!user) {
        setMessage("You must be logged in to upload files.");
        setUploading(false);
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch("/api/uploads/uploadFile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("File uploaded successfully!");
        setSignedUrl(data.signedUrl);
        setSelectedFile(null);
        setMonth(null);
        setYear(null);

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

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6 shadow-md mt-0 bg-[var(--user-section-bg-color)]">
      <h1 className="text-base font-bold mb-4 text-center text-[color:var(--body-text-color)]">
        UPLOAD FILE
      </h1>
      <div className="flex flex-col gap-4 w-full">
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
          className="w-full p-2 rounded-md text-[color:var(--body-text-color)] bg-[var(--signin-input-bg-color)] border-[var(--signin-input-border-color)] cursor-pointer text-sm sm:text-base"
          disabled={uploading}
        >
          <option value="" disabled>
            Select File Type
          </option>
          <option value="shukkimboTemplate">Shukkimbo Template</option>
          <option value="workingSchedule">Working Schedule</option>
        </select>

        <MonthYearSelect
          month={month}
          year={year}
          onMonthChange={setMonth}
          onYearChange={setYear}
          disabled={uploading}
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={uploading}
        className={`w-full mt-4 py-2 px-4 rounded-md text-white transition-all duration-200 ${
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
            <div className="flex items-center justify-between w-full p-2 bg-[var(--signin-input-bg-color)] rounded-md">
              <input
                type="text"
                value={signedUrl}
                readOnly
                className="w-full bg-transparent text-xs sm:text-sm text-[color:var(--body-text-color)] cursor-default"
              />
              <button
                onClick={handleCopyUrl}
                className="py-1 px-3 ml-2 text-xs font-medium text-white rounded-md bg-[var(--signin-btn-bg-color)] hover:bg-blue-600"
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
