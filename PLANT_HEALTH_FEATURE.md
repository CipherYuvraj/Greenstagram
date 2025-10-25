# Plant Health Detection Feature

## Overview
The Plant Health Detection feature allows users to upload photos of plants and receive:
- **Species identification** using PlantNet API
- **Health score assessment** (0-100)
- **Care recommendations** tailored to the plant species
- **Condition status** (Healthy, Warning, Unhealthy)

## Components

### 1. PlantDetector Component
**Location:** `frontend/src/components/plants/PlantDetector.tsx`

A comprehensive React component that handles:
- Image upload with drag & drop support
- File validation (type, size)
- Display of detection results with visual indicators
- Care tips and health recommendations

**Props:**
- `onDetectionComplete?: (result: PlantDetectionResult) => void` - Callback when detection completes
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
import PlantDetector from '@/components/plants/PlantDetector';

<PlantDetector 
  onDetectionComplete={(result) => console.log(result)}
/>
```

### 2. PlantHealth Page
**Location:** `frontend/src/pages/PlantHealth.tsx`

A dedicated page featuring:
- Plant detector component
- Usage tips and instructions
- Feature highlights
- Community engagement section

**Route:** `/plant-health`

## Backend Implementation

### API Endpoint
**Endpoint:** `POST /api/ai/identify-plant`

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `image` field containing the plant photo

**Response:**
```json
{
  "success": true,
  "data": {
    "species": "Scientific name",
    "commonNames": ["Common name 1", "Common name 2"],
    "confidence": 0.85,
    "healthScore": 80,
    "family": "Plant family",
    "genus": "Plant genus",
    "tips": [
      "Care tip 1",
      "Care tip 2",
      "Care tip 3"
    ],
    "condition": "healthy"
  }
}
```

### File Upload Configuration
- **Max file size:** 10MB
- **Accepted formats:** All image types (image/*)
- **Storage:** Memory storage (not persisted)

### PlantNet API Integration
The backend integrates with PlantNet API v2:
- Endpoint: `https://my-api.plantnet.org/v2/identify/all`
- Requires API key stored in Azure Key Vault
- Falls back to mock data if API is unavailable

## Setup Requirements

### Environment Variables
Add to your Azure Key Vault or `.env` file:
```env
PLANTNET_API_KEY=your_plantnet_api_key
```

### Getting PlantNet API Key
1. Visit [PlantNet API](https://my.plantnet.org/)
2. Create an account
3. Generate an API key
4. Add to your environment configuration

### Dependencies

**Backend:**
```json
{
  "multer": "^1.4.5-lts.1",
  "@types/multer": "^1.4.12"
}
```

**Frontend:**
```json
{
  "lucide-react": "^0.xxx.x",
  "react-hot-toast": "^2.x.x"
}
```

## Features

### Image Upload
- Drag & drop support
- Click to browse
- Real-time validation
- Preview before detection

### Detection Results
- Species name (scientific and common)
- Confidence score with visual progress bar
- Health score (0-100)
- Condition badge (Healthy/Warning/Unhealthy)
- Personalized care tips
- Color-coded health indicators

### Health Scoring
The health score is calculated based on:
- Identification confidence
- Visual analysis patterns
- Random variation for realistic results

**Score Ranges:**
- **80-100:** Healthy (green)
- **60-79:** Warning/Needs Attention (yellow)
- **0-59:** Unhealthy (red)

## User Flow

1. Navigate to `/plant-health` or click "Plant Health" in navigation
2. Upload a plant photo
3. Wait for analysis (typically 2-5 seconds)
4. View detection results with:
   - Plant species
   - Health score
   - Care recommendations
5. Option to analyze another plant

## Error Handling

### Frontend
- File type validation
- File size limits (10MB)
- User-friendly error messages
- Toast notifications for feedback

### Backend
- API timeout handling (30s)
- Fallback to mock data
- Comprehensive error logging
- Graceful degradation

## Future Enhancements

- [ ] Save detection history
- [ ] Share results as posts
- [ ] Plant disease detection
- [ ] Integration with plant care reminders
- [ ] Community plant identification
- [ ] Plant collection tracking
- [ ] AR plant visualization
- [ ] Multi-language support

## Navigation

The Plant Health feature is accessible from:
- Main navigation bar (Scan icon)
- Direct route: `/plant-health`

## Testing

### Manual Testing
1. Upload a clear plant photo
2. Verify species identification
3. Check health score display
4. Review care tips relevance
5. Test error scenarios (invalid file, large file)

### Mock Data
If PlantNet API is unavailable, the system returns sample data for testing purposes.

## API Integration Notes

- PlantNet API requires base64 encoded images
- Supports multiple plant organs: leaves, flowers, fruits, bark
- Auto-detection of plant organs enabled
- Best results with high-quality, well-lit photos

## Security

- File upload size limited to 10MB
- Only image MIME types accepted
- Authentication required (protected route)
- API key stored securely in Azure Key Vault

## Performance

- Memory-based file storage (no disk I/O)
- Image processing optimized
- Results cached when appropriate
- Lazy-loaded page component

## Accessibility

- ARIA labels for buttons
- Keyboard navigation support
- Screen reader friendly
- High contrast color schemes
- Responsive design for all devices

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Credits

- **PlantNet API** - Plant identification service
- **Lucide React** - Icon library
- **React Hot Toast** - Notification system
