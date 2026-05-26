# Cedar Grove VBS Registration Setup

This package adds a custom Jekyll page at `/vbs-registration/` with matching CSS and JavaScript.

## Files added or changed

- `vbs-registration.html`
- `assets/css/vbs-registration.css`
- `assets/js/vbs-registration.js`
- `_includes/nav.html` updated with a VBS Registration nav link
- `cloudflare-worker/vbs-registration-worker.js` example endpoint

## Important

The website is hosted as a static Jekyll/GitHub Pages site. That means the form cannot securely save submissions directly into Microsoft 365 from the browser. Do not put Microsoft Graph secrets, tenant IDs with secrets, or app credentials in public JavaScript.

The recommended path is:

1. Create a Microsoft SharePoint List named `VBS Registrations`.
2. Create columns that match the field names in `cloudflare-worker/vbs-registration-worker.js`.
3. Create a Microsoft Entra app registration with Graph permissions for writing list items.
4. Deploy the included Cloudflare Worker or Pages Function.
5. Add the Worker URL to `vbs-registration.html` before the closing front matter/content area with:

```html
<script>
  window.CG_VBS_ENDPOINT = "https://your-worker-url.workers.dev";
</script>
```

The included JavaScript checks this endpoint when the user submits the form, so the script can stay inside `vbs-registration.html` as shown in the file.

## SharePoint column internal names used by the Worker

- Title
- SubmittedAt
- ChildName
- Address
- City
- State
- ZipCode
- Gender
- DateOfBirth
- AgeGroup
- ShirtSize
- FoodAllergies
- EnvironmentalAllergies
- MedicalConcerns
- SpecialNeedsInfo
- SupportIfNeeded
- GuardianFirstName
- GuardianLastName
- GuardianEmail
- PrimaryPhone
- PhotoPermission
- LimitedPhotoRequests
- GuardianCertification
- EmergencyContact
- EmergencyPhone
- HomeChurch
- MailingPermission
- HeardAbout
- HeardAboutOther

SharePoint internal column names can be picky. Create the columns with these exact names before renaming their display labels.

Recommended display labels for the new care/support columns:

- `SpecialNeedsInfo` → `Special Needs, Accommodations, or Helpful Information`
- `SupportIfNeeded` → `Best way to support this child if needed`

Use **Multiple lines of text** for both of these columns.
