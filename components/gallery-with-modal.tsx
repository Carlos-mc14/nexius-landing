'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

// Componente Modal para mostrar imagen expandida
const ImageModal = ({ 
  isOpen, 
  onClose, 
  images, 
  currentIndex, 
  onNavigate, 
  projectName 
}: {
  isOpen: boolean
  onClose: () => void
  images: string[]
  currentIndex: number
  onNavigate: (index: number) => void
  projectName: string
}) => {
  if (!isOpen) return null;

  const handlePrevious = () => {
    onNavigate(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
  };

  const handleNext = () => {
    onNavigate(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
  };

  // Efecto para manejar teclas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, currentIndex]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
        aria-label="Cerrar modal"
      >
        <X size={24} />
      </button>

      {/* Navegación anterior */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
          className="absolute left-4 text-white hover:text-gray-300 z-10 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
          aria-label="Imagen anterior"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Imagen principal */}
      <div 
        className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[currentIndex] || "/placeholder.svg?height=720&width=1280"}
          alt={`${projectName} - Imagen ${currentIndex + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
        />
      </div>

      {/* Navegación siguiente */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 text-white hover:text-gray-300 z-10 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
          aria-label="Imagen siguiente"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Indicador de posición */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

// Componente principal de la galería
export const GalleryWithModal = ({ project }: { project: any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const navigateImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Si no hay galería, no mostrar nada
  if (!project.gallery || project.gallery.length === 0) {
    return null;
  }

  return (
    <>
      {/* Gallery */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Galería</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.gallery.map((image: string, index: number) => (
            <div 
              key={index} 
              className="relative aspect-video overflow-hidden rounded-lg border cursor-pointer hover:opacity-90 transition-all duration-300 group"
              onClick={() => openModal(index)}
            >
              <Image
                src={image || "/placeholder.svg?height=720&width=1280"}
                alt={`${project.name} - Imagen ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Overlay de hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded-full p-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L16.514 16.506L21 21ZM18 10.5C18 15.194 14.194 19 9.5 19C4.806 19 1 15.194 1 10.5C1 5.806 4.806 2 9.5 2C14.194 2 18 5.806 18 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8L12 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M9.5 10.5L14.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de imagen expandida */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={closeModal}
        images={project.gallery}
        currentIndex={currentImageIndex}
        onNavigate={navigateImage}
        projectName={project.name}
      />
    </>
  );
};