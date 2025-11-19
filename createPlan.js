document.addEventListener('DOMContentLoaded', function () {
	// Weight toggle functionality
	const weightInput = document.getElementById('weight');
	const weightLabel = document.getElementById('weightLabel');
	const weightToggle = document.getElementById('weightToggle');
	let isLbs = true; // track current unit

	if (weightToggle) {
		weightToggle.addEventListener('click', function (e) {
			e.preventDefault();
			const currentValue = parseFloat(weightInput.value);

			if (!isNaN(currentValue) && currentValue > 0) {
				// Convert between lbs and kg
				if (isLbs) {
					// Convert lbs to kg (1 lb = 0.453592 kg)
					const kgValue = (currentValue * 0.453592).toFixed(1);
					weightInput.value = kgValue;
					weightLabel.textContent = 'Weight (kg):';
					weightToggle.textContent = 'Switch to lbs';
				} else {
					// Convert kg to lbs (1 kg = 2.20462 lbs)
					const lbsValue = (currentValue * 2.20462).toFixed(1);
					weightInput.value = lbsValue;
					weightLabel.textContent = 'Weight (lbs):';
					weightToggle.textContent = 'Switch to kg';
				}
				isLbs = !isLbs;
			} else {
				alert('Please enter a valid weight value first.');
			}
		});
	}

	// Height toggle functionality
	const heightInput = document.getElementById('height');
	const heightLabel = document.getElementById('heightLabel');
	const heightToggle = document.getElementById('heightToggle');
	let isFootFeet = true; // track current unit

	// Helper function to parse feet notation (e.g., "5'10\"" or 5.83)
	const parseFeetInput = (input) => {
		const feetMatch = input.match(/(\d+)\s*['′]?\s*(\d+(?:\.\d+)?)?(?:\s*["″])?/);
		if (feetMatch) {
			const feet = parseInt(feetMatch[1], 10);
			const inches = feetMatch[2] ? parseFloat(feetMatch[2]) : 0;
			return feet + inches / 12; // convert to decimal feet
		}
		return parseFloat(input); // fallback to decimal
	};

	// Helper function to format decimal feet back to feet'inches"
	const formatFeetInput = (decimalFeet) => {
		const feet = Math.floor(decimalFeet);
		const inches = ((decimalFeet - feet) * 12).toFixed(1);
		return `${feet}'${inches}"`;
	};

	if (heightToggle) {
		heightToggle.addEventListener('click', function (e) {
			e.preventDefault();
			const currentValue = heightInput.value.trim();

			if (!currentValue) {
				alert('Please enter a valid height value first.');
				return;
			}

			try {
				if (isFootFeet) {
					// Convert feet to meters
					// 1 foot = 0.3048 meters
					const decimalFeet = parseFeetInput(currentValue);
					if (isNaN(decimalFeet) || decimalFeet <= 0) {
						alert('Please enter a valid height in feet (e.g., 5\'10" or 5.83)');
						return;
					}
					const metersValue = (decimalFeet * 0.3048).toFixed(2);
					heightInput.value = metersValue;
					heightLabel.textContent = 'Height (m):';
					heightToggle.textContent = 'Switch to feet';
					heightInput.placeholder = 'e.g., 1.78';
				} else {
					// Convert meters to feet
					// 1 meter = 3.28084 feet
					const metersValue = parseFloat(currentValue);
					if (isNaN(metersValue) || metersValue <= 0) {
						alert('Please enter a valid height in meters');
						return;
					}
					const decimalFeet = metersValue * 3.28084;
					heightInput.value = formatFeetInput(decimalFeet);
					heightLabel.textContent = 'Height (feet):';
					heightToggle.textContent = 'Switch to m';
					heightInput.placeholder = 'e.g., 5\'10" or 5.83';
				}
				isFootFeet = !isFootFeet;
			} catch (err) {
				alert('Error converting height. Please check your input.');
			}
		});
	}

	// Existing dropdown and conditions functionality
	const dropdownToggle = document.getElementById('dropdownToggle');
	const dropdownOptions = document.getElementById('conditionOptions');
	const conditionCheckboxes = document.querySelectorAll('#conditionOptions input[type="checkbox"]');
	const dropdownPlaceholder = document.getElementById('dropdownPlaceholder');
	const otherCheckbox = Array.from(conditionCheckboxes).find(cb => cb.value === 'Other');
	const otherWrapper = document.getElementById('otherConditionWrapper');
	const otherInput = document.getElementById('otherCondition');

	if (!dropdownToggle || !dropdownOptions) return;

	// toggle dropdown visibility
	dropdownToggle.addEventListener('click', function (e) {
		e.preventDefault();
		const isOpen = dropdownOptions.style.display !== 'none';
		dropdownOptions.style.display = isOpen ? 'none' : 'block';
		dropdownToggle.setAttribute('aria-expanded', !isOpen);
	});

	// close dropdown when clicking outside
	document.addEventListener('click', function (e) {
		if (!e.target.closest('#conditionDropdown')) {
			dropdownOptions.style.display = 'none';
			dropdownToggle.setAttribute('aria-expanded', 'false');
		}
	});

	// handle checkbox changes
	const updateDropdownText = function () {
		const selected = Array.from(conditionCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

		if (selected.length === 0) {
			dropdownPlaceholder.textContent = 'Select conditions...';
		} else {
			dropdownPlaceholder.textContent = selected.join(', ');
		}

		// show 'Other' input when selected
		const hasOther = otherCheckbox && otherCheckbox.checked;
		if (hasOther) {
			otherWrapper.style.display = 'block';
			if (otherInput) {
				otherInput.required = true;
				otherInput.focus();
			}
		} else {
			if (otherWrapper) otherWrapper.style.display = 'none';
			if (otherInput) {
				otherInput.required = false;
				otherInput.value = '';
			}
		}
	};

	// attach change listener to all checkboxes
	conditionCheckboxes.forEach(checkbox => {
		checkbox.addEventListener('change', updateDropdownText);
	});

	// ensure at least one condition is selected before submit
	const form = document.getElementById('planForm');
	if (form) {
		form.addEventListener('submit', function (e) {
			const selectedCheckboxes = Array.from(conditionCheckboxes).filter(cb => cb.checked);
			if (selectedCheckboxes.length === 0) {
				e.preventDefault();
				alert('Please select at least one existing condition.');
				return false;
			}

			// If 'Other' is selected but empty, block submission
			if (otherCheckbox && otherCheckbox.checked) {
				const otherVal = otherInput ? otherInput.value.trim() : '';
				if (!otherVal) {
					e.preventDefault();
					alert('You selected Other — please specify the condition in the text box.');
					otherInput.focus();
					return false;
				}
			}

			// allow form to submit when valid
			return true;
		});
	}
});

