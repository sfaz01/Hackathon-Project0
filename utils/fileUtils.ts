
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // result is in format "data:image/jpeg;base64,..."
      // we only want the part after the comma
      const base64String = (reader.result as string).split(',')[1];
      if (base64String) {
          resolve(base64String);
      } else {
          reject(new Error("Could not read file as base64 string."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};
