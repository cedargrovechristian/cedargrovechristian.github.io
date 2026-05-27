(function () {
  
  function getVbsEndpoint() {
  return "https://cedar-grove-vbs-registration.cedargrovechristiantn.workers.dev";
}

  function getCheckedValues(form, name) {
    return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((input) => input.value);
  }

  function getRadioValue(form, name) {
    const selected = form.querySelector(`input[name="${name}"]:checked`);
    return selected ? selected.value : "";
  }

  function showAlert(message, type) {
    const alert = document.getElementById("vbsFormAlert");
    if (!alert) return;
    alert.textContent = message;
    alert.className = `vbs-alert ${type}`;
    alert.hidden = false;
    alert.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function toggleLimitedPhotoRequired(form) {
    const limited = getRadioValue(form, "photoPermission") === "Limited permission";
    const limitedTextarea = document.getElementById("limitedPhotoRequests");
    const limitedWrap = document.getElementById("limitedPermissionWrap");
    if (!limitedTextarea || !limitedWrap) return;

    limitedTextarea.required = limited;
    limitedWrap.hidden = !limited;

    if (!limited) limitedTextarea.value = "";
  }

  function toggleHeardAboutOtherRequired(form) {
    const otherSelected = getCheckedValues(form, "heardAbout").includes("Other");
    const otherInput = document.getElementById("heardAboutOther");
    const otherWrap = document.getElementById("heardAboutOtherWrap");
    if (!otherInput || !otherWrap) return;

    otherInput.required = otherSelected;
    otherWrap.hidden = !otherSelected;

    if (!otherSelected) otherInput.value = "";
  }

  function buildPayload(form) {
    const formData = new FormData(form);
    return {
      submittedAt: new Date().toISOString(),
      childName: formData.get("childName") || "",
      address: formData.get("address") || "",
      city: formData.get("city") || "",
      state: formData.get("state") || "",
      zipCode: formData.get("zipCode") || "",
      gender: formData.get("gender") || "",
      dateOfBirth: formData.get("dateOfBirth") || "",
      ageGroup: formData.get("ageGroup") || "",
      shirtSize: formData.get("shirtSize") || "",
      foodAllergies: formData.get("foodAllergies") || "",
      environmentalAllergies: formData.get("environmentalAllergies") || "",
      medicalConcerns: formData.get("medicalConcerns") || "",
      specialNeedsInfo: formData.get("specialNeedsInfo") || "",
      supportIfNeeded: formData.get("supportIfNeeded") || "",
      guardianFirstName: formData.get("guardianFirstName") || "",
      guardianLastName: formData.get("guardianLastName") || "",
      guardianEmail: formData.get("guardianEmail") || "",
      primaryPhone: formData.get("primaryPhone") || "",
      photoPermission: getRadioValue(form, "photoPermission"),
      limitedPhotoRequests: formData.get("limitedPhotoRequests") || "",
      guardianCertification: formData.get("guardianCertification") === "Yes",
      emergencyContact: formData.get("emergencyContact") || "",
      emergencyPhone: formData.get("emergencyPhone") || "",
      homeChurch: getRadioValue(form, "homeChurch"),
      mailingPermission: getRadioValue(form, "mailingPermission"),
      heardAbout: getCheckedValues(form, "heardAbout"),
      heardAboutOther: formData.get("heardAboutOther") || ""
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("vbsRegistrationForm");
    const button = document.getElementById("vbsSubmitButton");
    if (!form || !button) return;

    toggleLimitedPhotoRequired(form);
    form.querySelectorAll('input[name="photoPermission"]').forEach((input) => {
      input.addEventListener("change", () => toggleLimitedPhotoRequired(form));
    });

    toggleHeardAboutOtherRequired(form);
    form.querySelectorAll('input[name="heardAbout"]').forEach((input) => {
      input.addEventListener("change", () => toggleHeardAboutOtherRequired(form));
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (form.website && form.website.value) return;

      if (getCheckedValues(form, "heardAbout").length === 0) {
        showAlert("Please select at least one option for how you heard about VBS.", "error");
        return;
      }

      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        showAlert("Please complete the required fields before submitting.", "error");
        return;
      }

      const vbsEndpoint = getVbsEndpoint();
      

      if (!vbsEndpoint) {
        showAlert("This form page is ready, but the submission endpoint has not been connected yet. Add your Cloudflare/Microsoft endpoint URL in vbs-registration.html before going live.", "error");
        return;
      }

      button.disabled = true;
      button.textContent = "Submitting...";

      try {
        const response = await fetch(vbsEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload(form))
        });

        if (!response.ok) throw new Error("Submission failed");

        form.reset();
        form.classList.remove("was-validated");
        toggleLimitedPhotoRequired(form);
        toggleHeardAboutOtherRequired(form);
        showAlert("Thank you. Your VBS registration has been submitted.", "success");
      } catch (error) {
        showAlert("Something went wrong and the registration was not submitted. Please try again or contact Cedar Grove Christian.", "error");
      } finally {
        button.disabled = false;
        button.textContent = "Submit Registration";
      }
    });
  });
})();
