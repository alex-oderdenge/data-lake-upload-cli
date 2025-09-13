"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { FileUpload } from "./components/fileUpload";

export default function Home() {
  return (
    <div className={styles.page}>
      <h1>Welcome to Data Lake Upload CLI</h1>
      <p>Your gateway to seamless data lake uploads.</p>
      <h2>File upload</h2>
      <FileUpload
        onUploadSuccess={(result) => console.log('Upload successful:', result)}
        onUploadError={(error) => console.error('Upload failed:', error)}
      />
    </div>
  );
}
