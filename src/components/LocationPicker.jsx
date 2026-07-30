import { useState } from "react";
import { MapPin, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function LocationPicker({ onLocationChange, disabled }) {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const getLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolokasi tidak mendatur pada browser ini.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let alamat = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await res.json();
          if (data?.display_name) {
            alamat = data.display_name;
          }
        } catch {
          // fallback to coordinates
        }

        const loc = { latitude, longitude, alamat };
        setLocation(loc);
        onLocationChange?.(loc);
        setLoading(false);
      },
      (err) => {
        setError(
          err.code === 1
            ? "Akses lokasi ditolak. Silakan bantakan akses lokasi dalam browser."
            : "Gagal mendapatkan lokasi. Silakan menang mulai."
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div>
      <button
        type="button"
        onClick={getLocation}
        disabled={loading || disabled}
        className="neo-btn neo-btn-blue"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Mendapatkan Lokasi...
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4" />
            {location ? "Ambil Lokasi Mulai" : "Ambil Lokasi GPS"}
          </>
        )}
      </button>

      {error && (
        <div className="flex items-center gap-2 mt-3 p-3 rounded-xl border-[2px] border-black bg-neo-pink/30 text-sm font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {location && !error && (
        <div className="flex items-start gap-2 mt-3 p-3 rounded-xl border-[2px] border-black bg-neo-green/30 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Lokasi mendapatkan!</p>
            <p className="text-xs mt-1">{location.alamat}</p>
            <p className="text-xs font-mono mt-1">
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}