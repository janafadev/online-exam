/**
 * Starts a countdown timer.
 * @param {number} durationInMinutes - The total duration of the exam in minutes.
 * @param {HTMLElement} displayElement - The HTML element (e.g., a <div>) to display the timer.
 * @param {HTMLFormElement} formElement - The HTML form element to auto-submit when time is up.
 */
function startTimer(durationInMinutes, displayElement, formElement) {
    let timer = durationInMinutes * 60;
    let minutes, seconds;

    const interval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        // Add leading zeros if needed
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        // Update the timer display
        displayElement.textContent = minutes + ":" + seconds;

        // Check if the timer has run out
        if (--timer < 0) {
            clearInterval(interval);
            displayElement.textContent = "TEMPS ÉCOULÉ";
            displayElement.style.color = "red"; // Make it obvious

            // !!! THIS IS THE AUTO-SUBMIT !!!
            alert("Le temps est écoulé ! Votre examen va être soumis."); // Give user a heads-up
            formElement.submit();
        }
    }, 1000); // Update every second
}
