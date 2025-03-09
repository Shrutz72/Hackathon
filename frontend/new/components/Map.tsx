"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Simple Map component that doesn't rely on react-leaflet
// This avoids the chunk loading issues
const Map = ({
  issues = [],
  selectedIssue,
  onMarkerClick,
  onClick,
  marker,
  center = [13.0827, 80.2707],
  zoom = 12,
}) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const markersRef = useRef([])

  // Initialize map on component mount
  useEffect(() => {
    if (!mapRef.current) return

    // Fix Leaflet icon issue
    if (!L.Icon.Default.imagePath) {
      L.Icon.Default.imagePath = "https://unpkg.com/leaflet@1.7.1/dist/images/"
      L.Icon.Default.prototype._getIconUrl = () => `${L.Icon.Default.imagePath}marker-icon.png`
    }

    // Create map instance
    const map = L.map(mapRef.current).setView(center, zoom)
    mapInstanceRef.current = map

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    // Add click handler
    if (onClick) {
      map.on("click", (e) => {
        onClick(e)
      })
    }

    setIsMapReady(true)

    // Cleanup on unmount
    return () => {
      if (map) {
        map.remove()
        mapInstanceRef.current = null
      }
    }
  }, [center, zoom, onClick])

  // Handle markers for issues
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || !issues || issues.length === 0) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Add markers for each issue
    issues.forEach((issue) => {
      if (issue.coordinates && issue.coordinates.lat && issue.coordinates.lng) {
        const marker = L.marker([issue.coordinates.lat, issue.coordinates.lng])
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div>
              <h3 style="font-weight: bold;">${issue.title}</h3>
              <p>${issue.description}</p>
              <p style="font-size: 0.8rem; color: #666;">${issue.location}</p>
            </div>
          `)

        if (onMarkerClick) {
          marker.on("click", () => {
            onMarkerClick(issue)
          })
        }

        markersRef.current.push(marker)
      }
    })
  }, [issues, isMapReady, onMarkerClick])

  // Handle selected issue
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || !selectedIssue) return

    if (selectedIssue.coordinates && selectedIssue.coordinates.lat && selectedIssue.coordinates.lng) {
      mapInstanceRef.current.setView([selectedIssue.coordinates.lat, selectedIssue.coordinates.lng], 14)
    }
  }, [selectedIssue, isMapReady])

  // Handle marker for location selection
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return

    // Remove existing selection marker
    if (markersRef.current.selectionMarker) {
      markersRef.current.selectionMarker.remove()
      markersRef.current.selectionMarker = null
    }

    // Add new marker if location is selected
    if (marker && marker.lat && marker.lng) {
      markersRef.current.selectionMarker = L.marker([marker.lat, marker.lng])
        .addTo(mapInstanceRef.current)
        .bindPopup("Selected location")
    }
  }, [marker, isMapReady])

  return (
    <div className="h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-500">Loading map...</div>
        </div>
      )}
    </div>
  )
}

export default Map

