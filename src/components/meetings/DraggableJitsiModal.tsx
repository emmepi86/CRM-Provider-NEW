import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface DraggableJitsiModalProps {
  roomName: string;
  meetingUrl: string;
  displayName: string;
  jwtToken?: string;
  onClose: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export const DraggableJitsiModal: React.FC<DraggableJitsiModalProps> = ({
  roomName,
  meetingUrl,
  displayName,
  jwtToken,
  onClose,
}) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const nodeRef = useRef<HTMLElement>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Extract domain from meeting URL
  const domain = new URL(meetingUrl).hostname;

  // Load Jitsi External API script
  useEffect(() => {
    if (window.JitsiMeetExternalAPI) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Jitsi External API');
      alert('Errore nel caricamento di Jitsi. Verifica che il server sia raggiungibile.');
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [domain]);

  // Initialize Jitsi when script is loaded
  useEffect(() => {
    if (!scriptLoaded || !jitsiContainerRef.current) return;

    const options: any = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: displayName,
      },
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: true,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        BRAND_WATERMARK_LINK: '',
        DEFAULT_BACKGROUND: '#474747',
        DISABLE_VIDEO_BACKGROUND: false,
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'profile',
          'chat',
          'recording',
          'livestreaming',
          'etherpad',
          'sharedvideo',
          'settings',
          'raisehand',
          'videoquality',
          'filmstrip',
          'invite',
          'feedback',
          'stats',
          'shortcuts',
          'tileview',
          'videobackgroundblur',
          'download',
          'help',
          'mute-everyone',
        ],
      },
    };

    // Add JWT token if provided
    if (jwtToken) {
      options.jwt = jwtToken;
    }

    try {
      jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);

      jitsiApiRef.current.on('readyToClose', () => {
        onClose();
      });
    } catch (error) {
      console.error('Error initializing Jitsi:', error);
      alert('Errore nell\'inizializzazione del meeting');
    }

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [scriptLoaded, roomName, domain, displayName, jwtToken, onClose]);

  const handleToggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const modalContent = (
    <div
      ref={nodeRef as any}
      className={`bg-white rounded-lg shadow-2xl flex flex-col ${
        isMaximized ? 'fixed inset-4 z-50' : 'w-[900px] h-[600px]'
      }`}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 text-white rounded-t-lg cursor-move handle">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-medium">Meeting in corso</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleMaximize}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title={isMaximized ? 'Ripristina' : 'Massimizza'}
          >
            {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-600 rounded transition-colors"
            title="Chiudi"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Jitsi Container */}
      <div className="flex-1 bg-black rounded-b-lg overflow-hidden" style={{ pointerEvents: isDragging ? 'none' : 'auto' }}>
        {!scriptLoaded ? (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Caricamento meeting...</p>
            </div>
          </div>
        ) : (
          <div ref={jitsiContainerRef} className="w-full h-full" />
        )}
      </div>
    </div>
  );

  if (isMaximized) {
    return modalContent;
  }

  return (
    <Draggable
      handle=".handle"
      bounds="#jitsi-modal-container"
      defaultPosition={{ x: 100, y: 50 }}
      nodeRef={nodeRef as any}
      onStart={() => setIsDragging(true)}
      onStop={() => setIsDragging(false)}
    >
      {modalContent}
    </Draggable>
  );
};
