import { useState, ChangeEvent, useRef } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import Spinner from "@/components/Spinner/Spinner";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

export default function Upload() {
  const { user, loading, isAuthorized, signOutUser } = useAuthContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [signedUrl, setSignedUrl] = useState<string>("");
  const [copyMessage, setCopyMessage] = useState<string>("");

  const [fileType, setFileType] = useState<string>(""); // Start with an empty value for file type
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null); // Reference for the file input

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center text-[color:var(--body-text-color)]">
        <p className="text-lg">You must be logged in to access this page.</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center text-[color:var(--body-text-color)]">
        <p className="text-lg">You are not authorized to access this page.</p>
      </div>
    );
  }

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
        setMessage("Failed to upload file.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Error uploading file.");
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
    <DashboardLayout user={user} signOutUser={signOutUser}>
      <div className="max-w-lg mx-auto p-4 sm:p-6 shadow-md rounded-lg mt-6 bg-[var(--user-section-bg-color)]">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center text-[color:var(--body-text-color)]">
          Upload Files
        </h1>
        <p className="mb-4 text-sm sm:text-base text-center text-[color:var(--body-text-color)]">
          Upload the files to get started with schedule generation.
        </p>

        <div className="flex flex-col items-center mb-4 w-full">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-[color:var(--body-text-color)] bg-[var(--signin-input-bg-color)] border-[var(--signin-input-border-color)]"
            disabled={uploading}
          />

          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="w-full mt-4 p-2 rounded-md text-[color:var(--body-text-color)] bg-[var(--signin-input-bg-color)] border-[var(--signin-input-border-color)]"
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
            className="w-full mt-4 p-2 rounded-md text-[color:var(--body-text-color)] bg-[var(--signin-input-bg-color)] border-[var(--signin-input-border-color)]"
            disabled={uploading}
          >
            <option value="">Select Month</option>
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full mt-4 p-2 rounded-md text-[color:var(--body-text-color)] bg-[var(--signin-input-bg-color)] border-[var(--signin-input-border-color)]"
            disabled={uploading}
          >
            <option value="">Select Year</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`w-full py-2 px-4 rounded-md text-white transition-all duration-200 ${
            uploading
              ? "bg-[var(--sidebar-border-color)] cursor-not-allowed"
              : "bg-[var(--signin-btn-bg-color)]"
          }`}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {message && (
          <div className="mt-4 h-20 w-full flex items-center justify-center transition-all duration-300">
            <div className="p-3 text-center rounded-md text-sm sm:text-base bg-[var(--signin-container-bg-color)] text-[color:var(--body-text-color)]">
              {message}
            </div>
          </div>
        )}

        {signedUrl && (
          <div className="mt-4 p-4 rounded-md border w-full bg-[var(--user-section-bg-color)] border-[var(--sidebar-border-color)]">
            <p className="mb-2 text-sm sm:text-base text-center text-[color:var(--body-text-color)]">
              Your file is ready!
            </p>
            <div className="flex flex-col items-center">
              <p className="text-xs sm:text-sm break-all w-full mb-2 text-left p-2 rounded-md bg-[var(--signin-input-bg-color)] text-[color:var(--body-text-color)]">
                {signedUrl}
              </p>
              <button
                onClick={handleCopyUrl}
                className="py-1 px-4 text-sm font-medium text-white rounded-md bg-[var(--signin-btn-bg-color)]"
              >
                Copy URL
              </button>
              {copyMessage && (
                <p className="mt-2 text-xs sm:text-sm text-center text-[color:var(--body-text-color)]">
                  {copyMessage}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
