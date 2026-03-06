import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Image as ImageIcon, X, RefreshCw, Send, Check } from 'lucide-react';

interface ImageUploaderProps {
    onMealAdded: (data: { imageBase64?: string; text?: string }) => void;
    onCancel: () => void;
}

export function ImageUploader({ onMealAdded, onCancel }: ImageUploaderProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [userInput, setUserInput] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Assign stream to video element after it renders into the DOM
    useEffect(() => {
        if (isCameraActive && videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [isCameraActive, stream]);

    // Start Camera
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Prefer back camera on mobile
            });
            setStream(mediaStream);
            setIsCameraActive(true);
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Could not access camera. Please check permissions or upload from gallery instead.');
        }
    };

    // Stop Camera
    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraActive(false);
    }, [stream]);

    // Capture Image from Video Stream
    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const base64Image = canvas.toDataURL('image/jpeg', 0.8);
                stopCamera();
                setPreviewImage(base64Image);
            }
        }
    };

    // Handle File Upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Image = event.target?.result as string;
            if (base64Image) {
                if (isCameraActive) stopCamera();
                setPreviewImage(base64Image);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleTextOnlySubmit = () => {
        if (userInput.trim()) {
            if (isCameraActive) stopCamera();
            onMealAdded({ text: userInput.trim() });
        }
    };

    const handleApproveImage = () => {
        if (previewImage) {
            onMealAdded({ imageBase64: previewImage, text: userInput.trim() });
        }
    };

    const handleCancelPreview = () => {
        setPreviewImage(null);
        // We do not clear user text here, just in case they want to keep writing or retake
    };

    const handleClose = () => {
        stopCamera();
        onCancel();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                    <h3 className="text-xl font-bold text-gray-900">Add Meal</h3>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

                    {/* Integrated Unified Text Field */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">What did you eat?</label>
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Describe your meal or add details (e.g. 'Chicken Salad, only ate half')"
                            className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base shadow-inner"
                            rows={3}
                        />
                    </div>

                    {/* Image Preview / Camera Viewport */}
                    <div className="relative w-full aspect-square bg-gray-100 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center shadow-inner group transition-colors hover:border-blue-300">
                        {previewImage ? (
                            <img src={previewImage} alt="Selected meal" className="w-full h-full object-cover" />
                        ) : isCameraActive ? (
                            <>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={stopCamera}
                                    className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer"
                                >
                                    <RefreshCw size={18} />
                                </button>
                            </>
                        ) : (
                            <div className="text-center space-y-4 p-6 pointer-events-none">
                                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 opacity-80 group-hover:scale-110 transition-transform">
                                    <Camera size={32} />
                                </div>
                                <div>
                                    <p className="text-gray-500 font-medium">Capture a visual</p>
                                    <p className="text-gray-400 text-xs mt-1">Photo helps AI estimate portion sizes accurately.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <canvas ref={canvasRef} className="hidden" />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                    />

                    {/* Action Buttons */}
                    <div className="space-y-4 mt-auto">
                        {previewImage ? (
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleCancelPreview}
                                    className="bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-4 px-3 rounded-2xl transition-all flex justify-center items-center gap-2 cursor-pointer"
                                >
                                    <X size={20} className="text-gray-400" />
                                    <span>Retake</span>
                                </button>
                                <button
                                    onClick={handleApproveImage}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-3 rounded-2xl shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2 cursor-pointer"
                                >
                                    <Check size={20} />
                                    <span>Approve & Analyze</span>
                                </button>
                            </div>
                        ) : isCameraActive ? (
                            <button
                                onClick={captureImage}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex justify-center items-center gap-2 text-lg cursor-pointer"
                            >
                                <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                </div>
                                Take Photo
                            </button>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={startCamera}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-3 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex flex-col justify-center items-center gap-2 cursor-pointer"
                                >
                                    <Camera size={24} />
                                    <span className="text-sm">Open Camera</span>
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-4 px-3 rounded-2xl transition-all flex flex-col justify-center items-center gap-2 cursor-pointer"
                                >
                                    <ImageIcon size={24} className="text-gray-400" />
                                    <span className="text-sm">From Gallery</span>
                                </button>
                            </div>
                        )}

                        {!isCameraActive && !previewImage && (
                            <>
                                <div className="relative flex items-center justify-center py-1">
                                    <div className="absolute inset-x-0 h-px bg-gray-100"></div>
                                    <span className="relative bg-white px-4 text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">OR</span>
                                </div>

                                <button
                                    onClick={handleTextOnlySubmit}
                                    disabled={!userInput.trim()}
                                    className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-40 disabled:grayscale transition-all font-bold py-4 px-6 rounded-2xl flex justify-center items-center gap-2 cursor-pointer"
                                >
                                    <Send size={18} />
                                    Analyze Description Only
                                </button>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
