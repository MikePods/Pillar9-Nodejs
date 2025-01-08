const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } = require("firebase/storage");

const firebaseConfig = {
	apiKey: "AIzaSyC0oYKXF6saQfbBcn52hKEWpkJzt2-vo_M",
	authDomain: "file-upload-demo-213de.firebaseapp.com",
	projectId: "file-upload-demo-213de",
	storageBucket: "file-upload-demo-213de.appspot.com",
	messagingSenderId: "238953808710",
	appId: "1:238953808710:web:ab780c6932be6b201d9b47",
};

initializeApp(firebaseConfig);

const storage = getStorage();

const imageUpload = async (imageData, name, folderName) => {
	const storageRef = ref(storage, `Pilar9/${folderName}/${name}.${imageData.originalname.split(".").pop()}`);
	const metaData = { contentType: imageData.mimetype };
	const snapShot = await uploadBytesResumable(storageRef, imageData.buffer, metaData);
	const downloadUrl = await getDownloadURL(snapShot.ref);
	return downloadUrl;
};

const deleteFromFirebase = async (url) => {
	try {
		const desertRef = ref(storage, url);
		await deleteObject(desertRef);
		return true;
	} catch (error) {
		return false;
	}
};

module.exports = { imageUpload, deleteFromFirebase };
