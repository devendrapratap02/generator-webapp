console.log("Hello World!!");

// Adding the ignore-click class to anchor tag will prevent from re-directing
document.querySelectorAll(".ignore-click").forEach(element => {
	element.addEventListener("click", (event) => {
		event.preventDefault();
	})
});
