document.addEventListener('DOMContentLoaded', () => {
  const yearSelect = document.getElementById('year');
  const monthSelect = document.getElementById('month');
  const stateSelect = document.getElementById('state');
  const districtSelect = document.getElementById('district');
  const filterBtn = document.getElementById('filterBtn');
  const qaContainer = document.getElementById('qaContainer');

  const apiUrl = 'https://api.data.gov.in/resource/cef25fe2-9231-4128-8aec-2c948fedd43f';
  const apiKey = '579b464db66ec23bdd000001a7a37c6753d241d158cfea482002a5b4';

  function populateYears() {
    const currentYear = new Date().getFullYear();
    for (let year = 2008; year <= currentYear; year++) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    }
  }

  function populateMonths() {
    for (let month = 1; month <= 12; month++) {
      const option = document.createElement('option');
      option.value = month;
      option.textContent = month;
      monthSelect.appendChild(option);
    }
  }

  function populateStates(data) {
    const states = [...new Set(data.map(record => record.StateName).filter(Boolean))].sort();
    stateSelect.innerHTML = `<option value="">Select a state</option>`;
    states.forEach(state => {
      const option = document.createElement('option');
      option.value = state;
      option.textContent = state;
      stateSelect.appendChild(option);
    });
  }

  function populateDistricts(data, selectedState) {
    const districts = [...new Set(data.filter(record => record.StateName === selectedState).map(record => record.DistrictName))].sort();
    districtSelect.innerHTML = `<option value="">Select a district</option>`;
    districts.forEach(district => {
      const option = document.createElement('option');
      option.value = district;
      option.textContent = district;
      districtSelect.appendChild(option);
    });
  }

  async function fetchData(filters = {}) {
    const queryParams = new URLSearchParams({
      'api-key': apiKey,
      'format': 'json',
      'limit': 1000,
      ...filters
    });

    const response = await fetch(`${apiUrl}?${queryParams.toString()}`);
    const data = await response.json();
    return data.records;
  }

  function displayQA(data) {
    qaContainer.innerHTML = '';
    data.forEach(record => {
      const question = document.createElement('p');
      const answer = document.createElement('p');
      question.className = 'question';
      answer.className = 'answer';
      question.textContent = `Question: ${record.QueryText || 'No Question'}`;
      answer.textContent = `Answer: ${record.KccAns || 'No Answer'}`;

      qaContainer.appendChild(question);
      qaContainer.appendChild(answer);
    });
  }

  async function onFilter() {
    const year = yearSelect.value;
    const month = monthSelect.value;
    const state = stateSelect.value;
    const district = districtSelect.value;

    const filters = {
      ...(year && { 'filters[year]': year }),
      ...(month && { 'filters[month]': month }),
      ...(state && { 'filters[StateName]': state }),
      ...(district && { 'filters[DistrictName]': district }),
    };

    const data = await fetchData(filters);
    displayQA(data);
  }

  filterBtn.addEventListener('click', onFilter);

  yearSelect.addEventListener('change', async () => {
    const year = yearSelect.value;
    const data = await fetchData({ 'filters[year]': year });
    populateStates(data);
  });

  stateSelect.addEventListener('change', async () => {
    const year = yearSelect.value;
    const state = stateSelect.value;
    const data = await fetchData({ 'filters[year]': year });
    populateDistricts(data, state);
  });

  populateYears();
  populateMonths();
});
