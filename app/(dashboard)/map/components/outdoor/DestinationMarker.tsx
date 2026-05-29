'use client'

import { Marker } from 'react-map-gl/mapbox'
import { motion } from 'framer-motion'
import { useMapStore } from '../../store/mapStore'

export default function DestinationMarker() {
  const activeRoute = useMapStore((s) => s.activeRoute)
  if (!activeRoute) return null

  const [lng, lat] = activeRoute.destinationCoords

  return (
    <Marker longitude={lng} latitude={lat} anchor="bottom">
      <div className="relative flex items-center justify-center">
        {/* Pulse ring */}
        <motion.div
          className="absolute w-8 h-8 rounded-full bg-red-500"
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {/* Central point */}
        <div className="w-4 h-4 rounded-full bg-red-600
                        border-2 border-white shadow-lg z-10" />
      </div>
    </Marker>
  )
}
