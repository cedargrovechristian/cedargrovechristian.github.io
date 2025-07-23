 const container = document.getElementById('live-container');
  if (typeof isLive !== 'undefined' && isLive) {
    container.innerHTML = `
      <iframe
        src="https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/100064446712278/live"
        width="100%"
        height="500"
        style="border:none;overflow:hidden"
        scrolling="no"
        frameborder="0"
        allowfullscreen="true"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
      </iframe>
    `;
  } else {
    container.innerHTML = `
      <div class="d-flex align-items-center justify-content-center bg-secondary text-white" style="height: 500px; border-radius: 0.5rem;">
        <div class="text-center">
          <h3>We're not live right now</h3>
          <p>Please check back during service hours!</p>
          <p><a href="archivedSermons.html" target="_blank" class="btn btn-light">Watch Past Services</a></p>
        </div>
      </div>
    `;
  }