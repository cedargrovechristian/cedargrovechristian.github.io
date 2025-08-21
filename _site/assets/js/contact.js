 const form = document.getElementById('contact-form');
  const formEndpoint = 'https://formspree.io/f/xldlravq'; // Replace with your actual Formspree endpoint

  form.addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent default page reload

    const formData = new FormData(form);

    try {
      const response = await fetch(formEndpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      if (response.ok) {
        // Hide form and show thank-you message
        form.innerHTML = `
          <div class="alert alert-success" role="alert">
            Thank you! Your message has been sent successfully.
          </div>
        `;
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again later.');
    }
  });

  function hideAddBtn(){
        document.getElementById('addAddressBtn').classList.add("hide")
        document.getElementById('removeAddressBtn').classList.remove("hide")
  }

    function hideRemoveBtn(){
        document.getElementById('addAddressBtn').classList.remove("hide")
        document.getElementById('removeAddressBtn').classList.add("hide")
  }