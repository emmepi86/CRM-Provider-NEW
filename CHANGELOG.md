# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2025-10-08

### Added
- **Badge System** for in-person and hybrid events
  - Visual drag & drop badge editor with real-time preview
  - Support for text, dynamic fields, images, and QR codes
  - Template system: create, edit, duplicate, import/export JSON templates
  - Front-only and double-sided badge support
  - Only available for RESIDENTIAL and HYBRID events (disabled for FAD/WEBINAR)
  - Badge tab in event detail page with conditional rendering
  - Integration with backend `/api/v1/events/{id}/badge-templates` endpoints

- **Event Edit Functionality**
  - Full edit modal with same comprehensive form as creation
  - Pre-populated with existing event data
  - Smart readonly protection: events synced from Moodle are protected
  - Visual indicator badge "Sincronizzato da Moodle" for readonly events
  - Edit button visible only for CRM-created events (`moodle_course_id IS NULL`)
  - Uses `PUT /api/v1/events/{event_id}` endpoint

- **Complete Event Creation Form** with all database fields
  - 6 collapsible sections: Basic Info, Venue, FAD Platform, ECM, Pricing, Registration
  - Conditional sections based on delivery_mode and event_type
  - All advanced fields: venue details, FAD platform, ECM certifications, pricing, materials
  - Dynamic field requirements matching backend validation
  - Event format selector (CORSO, CONGRESSO, CONVEGNO, WORKSHOP, SEMINARIO)
  - Pricing with early bird support and VAT configuration
  - Registration deadlines and public event URLs
  - 86 total fields covering complete event lifecycle

- **Participant Management**: Complete participant creation modal with all Agenas-required fields
  - Full demographic data (name, email, fiscal code, birth info)
  - Residence and contact information
  - Professional data with normalized profession/discipline selects
  - Professional order registration details
  - Workplace information
  - Notes and GDPR consent
  - Real-time duplicate checking (email, fiscal code, name)
  - Collapsible sections for better UX (6 organized sections)

- **Profession & Discipline Normalization**: Integration with standardized profession/discipline database
  - Dynamic select dropdowns with cascading disciplines
  - Same system used in both participants and speakers
  - Compliant with Agenas normative

- **Document Management - Explorer Layout**: Windows Explorer-style two-column layout
  - Left panel: Hierarchical folder tree with expand/collapse
  - Right panel: Breadcrumb navigation + content view
  - Auto-expand path to current folder
  - Visual selection highlighting

- **Drag & Drop - Complete System**:
  - Upload files by dragging from desktop into drop zone
  - Move files between folders by dragging in tree view
  - Reorganize folder hierarchy by dragging folders
  - Visual feedback (green highlight on drop target, opacity on dragged item)
  - Validation: prevents moving folders into themselves or descendants
  - Multi-file upload support (up to 50MB per file)

- **Participant Navigation**: Clickable participant names in enrollment tables
  - Click on participant name in event detail → navigate to participant detail page

### Fixed
- **Badge tab visibility issue**: Fixed enum value mismatch between backend (`RESIDENTIAL`, `FAD`, `HYBRID`) and frontend (was using Italian lowercase `residenziale`, `misto`)
- **Event type interface alignment**: Updated Event interface to match backend enum values exactly
- **Dashboard action buttons**: Added onClick handlers to "Nuovo Evento", "Nuovo Partecipante", and "Sync Moodle" buttons
- **Missing "Add Event" button**: Added "Nuovo Evento" button in EventList page (was never implemented)
- **Sponsor/Patronage 422 Errors**: Removed `event_id` from PATCH requests (only needed in POST)
- **Empty Date Fields**: Convert empty strings to `null` for date fields to satisfy Pydantic validation
  - Affects: sponsor contract_date, valid_from, valid_to
  - Affects: patronage issue_date, expiry_date

### Changed
- **Document Browser Layout**: Switched from grid-based to explorer-style layout
  - Better space utilization (25% tree + 75% content)
  - Persistent folder visibility
  - Improved drag & drop workflow

## [2025-10-06]

### Added
- Display course materials with completion status in ECM view
- Events list with detail page and enrollments table

### Documentation
- Added comprehensive session context transfer documentation
- Created SESSION_CONTEXT.md and QUICK_START.md for AI assistant handoffs

## [Initial Release]

### Added
- Initial project setup with Create React App
- Basic authentication system
- Tenant-based multi-tenancy
