// Alert message UI logic
export function showMessage(msg, color = 'green') {
  let alertContainer = document.getElementById('alert-container');
  if (!alertContainer) {
    alertContainer = document.createElement('div');
    alertContainer.id = 'alert-container';
    alertContainer.style.position = 'fixed';
    alertContainer.style.top = '32px';
    alertContainer.style.right = '32px';
    alertContainer.style.zIndex = '9999';
    alertContainer.style.display = 'flex';
    alertContainer.style.flexDirection = 'column';
    alertContainer.style.gap = '12px';
    document.body.appendChild(alertContainer);
  }
  while (alertContainer.firstChild) alertContainer.removeChild(alertContainer.firstChild);
  const alert = document.createElement('div');
  alert.className = `px-6 py-3 rounded-lg shadow-lg font-semibold text-base animate-fade-in-up`;
  alert.style.background = color === 'green' ? '#ffbd59' : color === 'red' ? '#e74c3c' : color === 'yellow' ? '#f1c40f' : '#34495e';
  alert.style.color = '#1f2833';
  alert.style.minWidth = '200px';
  alert.style.maxWidth = '350px';
  alert.style.marginLeft = 'auto';
  alert.style.opacity = '0.95';
  alert.textContent = msg;
  alertContainer.appendChild(alert);
  setTimeout(() => {
    alert.style.transition = 'opacity 0.5s';
    alert.style.opacity = '0';
    setTimeout(() => {
      if (alert.parentNode) alert.parentNode.removeChild(alert);
    }, 500);
  }, 2200);
}
