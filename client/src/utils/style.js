//logic to render mobile properly

export function setDocHeightOnWindow() {
  function setDocHeight() {
    document.documentElement.style.setProperty(
      "--vh",
      `${window.innerHeight / 100}px`
    );
  }
  window.addEventListener("resize", function() {
    setDocHeight();
  });
  window.addEventListener("orientationchange", function() {
    setDocHeight();
  });

  setDocHeight();
}

export function capitalizeFirstLetter(string) {
  const lowerString = string.toLowerCase();
  const strArray = lowerString.split(" ");
  const capitalizedStrArray = strArray.map(val => {
    return val.charAt(0).toUpperCase() + val.slice(1);
  });

  return capitalizedStrArray.join(" ")
}
