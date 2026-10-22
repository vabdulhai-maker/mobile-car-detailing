'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const services = {
  'Essential Detail': {price:149, description:'Exterior wash, wheels, glass & paint sealant', features:['Gentle hand wash and towel dry','Wheel, tire and arch cleaning','Exterior glass','Paint sealant and tire dressing']},
  'Interior Detail': {price:179, description:'A thorough reset for the cabin', features:['Interior vacuum','Carpet and upholstery cleaning','Leather cleaning and conditioning','Interior surfaces and glass']},
  'Signature Detail': {price:299, description:'Complete interior & exterior care', features:['Everything in Essential','Thorough interior vacuum','Carpet and upholstery cleaning','Leather care and surface detail']},
  'Ceramic Protection': {price:699, description:'Paint enhancement & ceramic coating', features:['Exterior wash and decontamination','Single-stage paint enhancement','Ceramic coating application','Aftercare guidance']}
};
const vehicles = {'Sedan / Coupe':0,'SUV / Crossover':50,'Truck / Van':80};
const addons = {'Pet hair removal':35,'Carpet spot treatment':30,'Headlight refresh':60};
let selectedVehicle = 'Sedan / Coupe';
let booking = {};
let step = 0;
let lastRequest = null;
let returnFocus = null;
const bookingDialog = $('#booking-dialog');
const infoDialog = $('#info-dialog');
const menu = $('#mobile-menu');
function syncDialogs() { document.body.classList.toggle('modal-open', $$('dialog[open]').length > 0); }
function openDialog(dialog) { returnFocus = document.activeElement; dialog.showModal(); syncDialogs(); }
function closeDialog(dialog) { dialog.close(); syncDialogs(); }
$$('dialog').forEach(dialog => {
  dialog.addEventListener('close', () => {
    syncDialogs();
    if (dialog === menu) $('#menu-open').setAttribute('aria-expanded', 'false');
    if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
  });
});
$$('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(document.getElementById(button.dataset.close))));
$('#menu-open').addEventListener('click', () => { openDialog(menu); $('#menu-open').setAttribute('aria-expanded', 'true'); });
$('.close-menu').addEventListener('click', () => closeDialog(menu));
$$('nav a', menu).forEach(link => link.addEventListener('click', () => closeDialog(menu)));
function showInfo(title, content) {
  $('#info-body').innerHTML = `<h2 id="info-title">${title}</h2>${content}`;
  openDialog(infoDialog);
}
$$('[data-call]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  showInfo('A preview of staying connected.', '<p>(512) 555-0148 is a fictional demo number. On a live business site, this button would open your phone’s dialer.</p><p>You can try the complete booking experience now. No call is placed.</p><button class="button wide" id="call-book">Try the booking flow ↗</button>');
  $('#call-book').addEventListener('click', () => { closeDialog(infoDialog); startBooking(); });
}));
$$('[data-service]').forEach(button => button.addEventListener('click', () => {
  const name = button.dataset.service === 'Exterior Detail' ? 'Essential Detail' : button.dataset.service;
  const service = services[name];
  showInfo(button.dataset.service, `<p>${service.description}. Sample starting price: <strong>$${service.price}</strong> for a sedan or coupe.</p><ul class="feature-list">${service.features.map(item => `<li>${item}</li>`).join('')}</ul><p>Vehicle condition and add-ons can change the final quote. All services and prices on this site are illustrative.</p><button class="button wide" id="detail-book">Choose this service ↗</button>`);
  $('#detail-book').addEventListener('click', () => { closeDialog(infoDialog); startBooking(name); });
}));
$$('[data-vehicle]').forEach(button => button.addEventListener('click', () => {
  selectedVehicle = button.dataset.vehicle;
  $$('[data-vehicle]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  $$('[data-price]').forEach(price => price.textContent = `$${Number(price.dataset.price) + vehicles[selectedVehicle]}`);
  $$('.vehicle-label').forEach(label => label.textContent = `${selectedVehicle} · Sample starting price`);
}));
$('#compare-range').addEventListener('input', event => {
  $('.comparison').style.setProperty('--reveal', `${event.target.value}%`);
  event.target.setAttribute('aria-valuetext', `${100 - Number(event.target.value)} percent gloss reveal`);
});
$('#gallery-toggle').addEventListener('click', event => {
  const button = event.currentTarget;
  const expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!expanded));
  $('#gallery-more').hidden = expanded;
  button.innerHTML = expanded ? 'See More Transformations <span>↗</span>' : 'Show Less <span>−</span>';
});
function saveLocal(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); return true; } catch { return false; }
}
$('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const record = Object.fromEntries(new FormData(form));
  if (!record.name.trim() || !record.message.trim()) { $('.form-status', form).textContent = 'Please enter your name and a message.'; return; }
  const saved = saveLocal('atelier-demo-message', {...record,createdAt:new Date().toISOString()});
  $('.form-status', form).textContent = saved ? 'Demo message saved on this device. Nothing was sent to a business.' : 'Device storage is unavailable. Your message has not been saved or sent.';
  if (saved) form.reset();
});
$('#privacy-open').addEventListener('click', () => {
  showInfo('A concept, thoughtfully transparent.', '<p>Atelier Detail is a fictional Austin, Texas business. Prices, contact details, service areas, and services are illustrative. Photos are AI-created. No real customer reviews or performance claims are presented.</p><h3>Your demo information</h3><p>Booking and contact forms save the most recent submission in this browser’s local storage. Nothing is emailed or sent to a detailing business. Use sample information when exploring. No payment is requested. Bookings are not confirmed.</p><p>You can delete demo submissions from this device below. Downloaded files must be deleted separately.</p><button class="button outline wide" id="clear-data">Delete saved demo data</button><p id="clear-status" role="status"></p>');
  $('#clear-data').addEventListener('click', () => {
    try { localStorage.removeItem('atelier-demo-request'); localStorage.removeItem('atelier-demo-message'); lastRequest = null; $('#clear-status').textContent = 'Saved demo data deleted from this browser.'; }
    catch { $('#clear-status').textContent = 'Storage is unavailable in this browser. No data could be accessed.'; }
  });
});
$('#year').textContent = new Date().getFullYear();
function startBooking(service) {
  if (menu.open) closeDialog(menu);
  step = 0;
  booking = {service:services[service] ? service : '',vehicle:selectedVehicle,addons:[],address:'',city:'Austin',zip:'',date:'',time:'',name:'',email:'',phone:''};
  renderStep();
  openDialog(bookingDialog);
}
$$('[data-book]').forEach(button => button.addEventListener('click', () => startBooking(button.dataset.book)));
function todayAustin() {
  const parts = new Intl.DateTimeFormat('en-US', {timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const part = type => parts.find(item => item.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
const field = (label, name, type = 'text', attrs = '', placeholder = '') => `<div class="field"><label for="book-${name}">${label}</label><input id="book-${name}" name="${name}" type="${type}" value="${escapeHTML(booking[name])}" ${attrs} placeholder="${placeholder}"></div>`;
function option(name, value, description, price = '', type = 'radio', checked = false) {
  return `<label class="option"><input type="${type}" name="${name}" value="${escapeHTML(value)}" ${checked ? 'checked' : ''}><span class="option-copy"><strong>${escapeHTML(value)}</strong><small>${escapeHTML(description)}</small></span>${price ? `<span class="option-price">${price}</span>` : ''}</label>`;
}
function estimate() { return services[booking.service].price + vehicles[booking.vehicle] + booking.addons.reduce((sum, name) => sum + addons[name], 0); }
function collectStep() {
  const form = $('#booking-form');
  if (!form) return;
  const data = new FormData(form);
  if (step === 0) booking.service = data.get('service') || '';
  if (step === 1) booking.vehicle = data.get('vehicle') || '';
  if (step === 2) booking.addons = data.getAll('addons');
  if (step === 3) ['address','city','zip'].forEach(key => booking[key] = String(data.get(key) || '').trim());
  if (step === 4) ['date','time'].forEach(key => booking[key] = String(data.get(key) || '').trim());
  if (step === 5) ['name','email','phone'].forEach(key => booking[key] = String(data.get(key) || '').trim());
}
function reviewRows() {
  return [
    ['Service',booking.service],
    ['Vehicle',booking.vehicle],
    ['Add-ons',booking.addons.join(', ') || 'None'],
    ['Service location',`${booking.address}\n${booking.city}, TX ${booking.zip}`],
    ['Preferred visit',`${new Intl.DateTimeFormat('en-US',{dateStyle:'long'}).format(new Date(`${booking.date}T12:00:00`))} · ${booking.time}\nAustin time (Central). Availability is not confirmed.`],
    ['Contact',`${booking.name}\n${booking.email}\n${booking.phone}`]
  ];
}
function renderStep() {
  const titles = ['Choose your care.','What do you drive?','The finishing touches.','Where should we meet?','Make time for your car.','A way to reach you.','Every detail, in order.'];
  const descriptions = ['A fresh start begins here. Select one service.','Choose the size that best fits your vehicle.','Optional extras. Choose any, or simply continue.','Use an example Austin-area address for this demo.','Select your preference. This is not live availability.','Use sample contact details to explore this demo.','Review your demo request before saving it.'];
  let content = '';
  if (step === 0) content = `<fieldset class="form-fieldset"><legend>Choose service</legend><div class="booking-options">${Object.entries(services).map(([name, data]) => option('service',name,data.description,`$${data.price}+`,'radio',booking.service === name)).join('')}</div></fieldset>`;
  if (step === 1) content = `<fieldset class="form-fieldset"><legend>Choose vehicle</legend><div class="booking-options">${Object.entries(vehicles).map(([name, price]) => option('vehicle',name,price ? 'Added to sample base price' : 'Sample base price',price ? `+$${price}` : 'Included','radio',booking.vehicle === name)).join('')}</div></fieldset>`;
  if (step === 2) content = `<fieldset class="form-fieldset"><legend>Optional add-ons</legend><div class="booking-options">${Object.entries(addons).map(([name, price]) => option('addons',name,'Sample add-on price',`+$${price}`,'checkbox',booking.addons.includes(name))).join('')}</div></fieldset>`;
  if (step === 3) content = field('Street address','address','text','autocomplete="street-address" required maxlength="200"','123 Example Street') + `<div class="field-row">${field('City','city','text','autocomplete="address-level2" required maxlength="100"')}${field('ZIP code','zip','text','autocomplete="postal-code" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" required','78701')}</div><p class="booking-demo-note">Texas service locations only in this concept. Service coverage would be confirmed by a real operator.</p>`;
  if (step === 4) content = field('Preferred date','date','date',`min="${todayAustin()}" required`) + `<div class="field"><label for="book-time">Preferred arrival window</label><select name="time" id="book-time" required><option value="">Choose a time window</option>${['8am – 10am','10am – 12pm','12pm – 2pm','2pm – 4pm'].map(time => `<option ${booking.time === time ? 'selected' : ''}>${time}</option>`).join('')}</select></div><p class="booking-demo-note">All times are Central Time (Austin). These are preferences, not confirmed appointment slots.</p>`;
  if (step === 5) content = field('Full name','name','text','autocomplete="name" required maxlength="100"','Alex Morgan') + field('Email address','email','email','autocomplete="email" required maxlength="200"','alex@example.com') + field('Phone number','phone','tel','autocomplete="tel" required maxlength="25"','(512) 555-0100');
  if (step === 6) content = `<dl class="review-list">${reviewRows().map(([label,value]) => `<div><dt>${label}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}</dl><div class="review-estimate"><span>Sample estimate</span><strong>$${estimate()}</strong></div><p class="booking-demo-note">Illustrative starting estimate before any applicable tax. Final scope and pricing would be confirmed by a real operator.</p><label class="consent"><input name="consent" type="checkbox" required><span>I understand this is a demo. My request is saved on this device only; no appointment is sent or confirmed.</span></label>`;
  $('#booking-body').innerHTML = `<p class="step-counter">STEP ${step + 1} OF 7</p><div class="progress-track" role="progressbar" aria-label="Booking progress" aria-valuemin="0" aria-valuemax="7" aria-valuenow="${step+1}"><span style="width:${(step+1)/7*100}%"></span></div><h2 id="booking-title" tabindex="-1">${titles[step]}</h2><p class="booking-intro">${descriptions[step]}</p><form id="booking-form">${content}<p class="field-error" role="alert" id="booking-error"></p><div class="booking-footer">${step ? '<button type="button" class="back-button" id="booking-back">← Back</button>' : ''}<button type="submit" class="button">${step === 6 ? 'Save Demo Request' : 'Continue'} <span>→</span></button></div></form><p class="booking-demo-note">DEMO EXPERIENCE · No payment. No live appointment.</p>`;
  bookingDialog.scrollTop = 0;
  if (bookingDialog.open) $('#booking-title').focus({preventScroll:true});
  $('#booking-back')?.addEventListener('click', () => { collectStep(); step--; renderStep(); });
  $('#booking-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    collectStep();
    let error = '';
    if (step === 0 && !booking.service) error = 'Please choose a service to continue.';
    if (step === 1 && !booking.vehicle) error = 'Please choose a vehicle type.';
    if (step === 3 && (!booking.address || !booking.city)) error = 'Please enter your street address and city.';
    if (step === 4 && booking.date < todayAustin()) error = 'Please select today or a future date.';
    if (step === 5 && (!booking.name || booking.phone.replace(/\D/g,'').length < 10)) error = 'Please enter your name and a phone number with at least 10 digits.';
    if (error) { $('#booking-error').textContent = error; return; }
    if (step < 6) { step++; renderStep(); } else finishBooking();
  });
}
function finishBooking() {
  const request = {...booking,addons:[...booking.addons],estimatedPrice:estimate(),currency:'USD',demo:true,createdAt:new Date().toISOString()};
  const saved = saveLocal('atelier-demo-request', request);
  lastRequest = request;
  $('#booking-body').innerHTML = `<div class="success-icon">✓</div><p class="eyebrow">DEMO COMPLETE</p><h2 id="booking-title" tabindex="-1" style="margin-top:12px">${saved ? 'Your demo request is saved.' : 'Your demo request is ready.'}</h2><p class="booking-intro">${saved ? 'Saved on this device only.' : 'Device storage is unavailable. Download a copy to keep your request.'} Nothing has been sent to a business, and no appointment is confirmed.</p><div class="review-estimate"><span>${escapeHTML(booking.service)}</span><strong>$${estimate()}</strong></div><p class="booking-demo-note">${escapeHTML(booking.vehicle)} · Sample estimate</p><div class="success-actions"><button class="button wide" id="download-request">Download request <span>↓</span></button><button class="button outline wide" id="finish-booking">Back to the website</button></div>`;
  $('#booking-title').focus({preventScroll:true});
  bookingDialog.scrollTop = 0;
  $('#download-request').addEventListener('click', () => {
    const blob = new Blob([`ATELIER DETAIL — DEMO REQUEST\n\nFictional business. This request was NOT sent. No appointment is confirmed.\n\n${reviewRows().map(([label,value]) => `${label}: ${value}`).join('\n\n')}\n\nSample estimate: $${lastRequest.estimatedPrice} USD before applicable tax\nCreated: ${lastRequest.createdAt}\n`], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'atelier-demo-request.txt'; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $('#finish-booking').addEventListener('click', () => closeDialog(bookingDialog));
}
