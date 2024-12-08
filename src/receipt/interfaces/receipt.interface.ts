interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface Receipt {
  bucket: string;
  created_at: FirestoreTimestamp;
  extracted_data: {
    payment_method: string;
    tax_value: number;
    total_value: number;
  };
  file_name: string;
  image_url: string;
  status: string;
}
