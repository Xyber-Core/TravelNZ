$(function () {
  $("#Nav").load("/SRC/HTML/Components/Nav.html", Link);
  $("#Footer").load("/SRC/HTML/Components/Footer.html");

  const isMobile = window.innerWidth <= 768;
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isMobileAgent = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());

  const pageToLoad = isMobile || isMobileAgent ? "Mobile.html" : "Home.html";

  loadPage(pageToLoad);

  if (pageToLoad === "Mobile.html") {
    $("#Nav").load("/SRC/HTML/Components/Nav.html", function () {
      $("#Nav").find("a, button").not(".logo").remove();
    });
    $("#disclaimerModal").remove();
    $("#disclaimerBtn").remove();
    $("#Footer").remove();
  }

  function loadPage(pageName) {
    const lower = pageName.toLowerCase();

    $("#Main").fadeOut(150, function () {
      $(this).load(`/SRC/HTML/Pages/${pageName}`, (response, status, xhr) => {
        if (status === "error") {
          console.error(`Error loading ${pageName}:`, xhr.status, xhr.statusText);
          return $(this).html("<p>Error loading page.</p>");
        }

        $(this).fadeIn(150);
        window.scrollTo(0, 0);

        if (!lower.includes("Mobile")) {
          if (lower.includes("tours")) initTours();
          if (lower.includes("contact")) initContactForm();
          if (lower.includes("about")) initFAQ();
        }
      });
    });
  }

  function Link() {
    $(document).on("click", ".dataLink", function (e) {
      e.preventDefault();
      const page = $(this).data("page");
      if (!page) return;

      $(".dataLink").removeClass("active");
      $(this).addClass("active");

      const fileName = page.charAt(0).toUpperCase() + page.slice(1) + ".html";
      loadPage(fileName);
    });
  }
});

