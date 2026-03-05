import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Image as ImageIcon, X, RefreshCw, PencilLine } from 'lucide-react';

interface ImageUploaderProps {
    onMealAdded: (data: { imageBase64?: string; textDescription?: string }) => void;
    onCancel: () => void;
}

export function ImageUploader({ onMealAdded, onCancel }: ImageUploaderProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [textInput, setTextInput] = useState('');
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
            // srcObject is assigned in the useEffect above, after re-render
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
                // Draw video frame to canvas
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Convert canvas to base64 jpeg
                const base64Image = canvas.toDataURL('image/jpeg', 0.8);

                // Stop camera and pass image up
                stopCamera();
                onMealAdded({ imageBase64: base64Image });
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
                onMealAdded({ imageBase64: base64Image });
            }
        };
        reader.readAsDataURL(file);
    };

    // Trigger hidden file input
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Handle Close/Cancel
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

                    {/* Camera Viewport or Placeholder */}
                    <div className="relative w-full aspect-square bg-gray-100 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center shadow-inner group transition-colors hover:border-blue-300">
                        {isCameraActive ? (
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
                                <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 opacity-80 group-hover:scale-110 transition-transform">
                                    <Camera size={40} />
                                </div>
                                <div>
                                    <p className="text-gray-500 font-medium">Ready to take a photo</p>
                                    <p className="text-gray-400 text-sm mt-1">Make sure the food is well-lit and fully in frame for best AI results.</p>
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
                    <div className="space-y-3 mt-auto">
                        {isCameraActive ? (
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
                            <button
                                onClick={startCamera}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex justify-center items-center gap-2 text-lg cursor-pointer"
                            >
                                <Camera size={24} />
                                Open Camera
                            </button>
                        )}

                        <div className="relative flex items-center justify-center py-2">
                            <div className="absolute inset-x-0 h-px bg-gray-200"></div>
                            <span className="relative bg-white px-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">OR</span>
                        </div>

                        <button
                            onClick={triggerFileInput}
                            className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-4 px-6 rounded-2xl transition-all flex justify-center items-center gap-2 cursor-pointer"
                        >
                            <ImageIcon size={22} className="text-gray-400" />
                            Upload from Gallery
                        </button>

                        <div className="relative flex items-center justify-center py-2">
                            <div className="absolute inset-x-0 h-px bg-gray-200"></div>
                            <span className="relative bg-white px-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">OR DESCRIBE MANUALLY</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <textarea
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="E.g., Chicken salad with rice and a glass of milk"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={2}
                            />
                            <button
                                onClick={() => {
                                    if (textInput.trim()) {
                                        stopCamera();
                                        onMealAdded({ textDescription: textInput.trim() });
                                    }
                                }}
                                disabled={!textInput.trim()}
                                className="w-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold py-3 px-6 rounded-xl transition-all flex justify-center items-center gap-2 cursor-pointer"
                            >
                                <PencilLine size={20} />
                                Add by Description
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
