import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline'; // For the close button icon
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules'; // Import Swiper modules

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
// import 'swiper/css/autoplay'; // Uncomment if you use Autoplay module

interface ImageViewerModalProps {
    images: string[]; // Array of image URLs
    isOpen: boolean;
    onClose: () => void;
    initialSlide?: number; // Optional: index of the image to show first
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
    images,
    isOpen,
    onClose,
    initialSlide = 0,
}) => {
    //console.log(images, 'images')
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[10000]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black bg-opacity-75" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all relative">
                                {/* Close Button */}
                                <button
                                    type="button"
                                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-10"
                                    onClick={onClose}
                                >
                                    <span className="sr-only">Close</span>
                                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                </button>

                                {/* Modal Title (Optional) */}
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900 mb-4 text-center"
                                >
                                    Image Viewer
                                </Dialog.Title>

                                {/* Swiper Carousel */}
                                <Swiper
                                    modules={[Navigation, Pagination, A11y, Autoplay]} // Add Autoplay if needed
                                    spaceBetween={10}
                                    slidesPerView={1}
                                    navigation // Enable navigation arrows
                                    pagination={{ clickable: true }} // Enable pagination dots
                                    initialSlide={initialSlide} // Start at a specific slide
                                    // autoplay={{ delay: 2500, disableOnInteraction: false }} // Uncomment for autoplay
                                    className="w-full h-auto max-h-[80vh]" // Adjust height as needed
                                >
                                    {images.length > 0 ? (
                                        images.map((image:any, index:number) => (
                                            <SwiperSlide key={index} className="flex justify-center items-center">
                                                <img
                                                    src={image}
                                                    alt={`Carousel image ${index + 1}`}
                                                    className="max-w-full max-h-[70vh] object-contain mx-auto" 
                                                />
                                            </SwiperSlide>
                                        ))
                                    ) : (
                                        <div className="flex justify-center items-center h-48 text-gray-500">
                                            No images to display.
                                        </div>
                                    )}
                                </Swiper>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ImageViewerModal;