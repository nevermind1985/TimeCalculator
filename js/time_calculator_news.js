/*
- Bisogna creare lo stile specifico con lo stesso nome di newsCookieValue nel file time_calculator_news.css
- In index.html bisogna andare a scrivere nel div newsContainer la news da mostrare

-test newsAnimation
*/
var newsCookieValue = "BrowserExtension";

function checkForNews() {
	if(newsCookieValue != "") {
		var news = getCookie("news");
		if((news != "" && news != null && news != newsCookieValue) || (news == null)) {
			setCookie("news", newsCookieValue);
			document.getElementById('newsContainer').classList.add(newsCookieValue);
			document.getElementById('newsContainer').style.display = 'block';
			document.getElementById('newsContainer').style.animationName = newsCookieValue;
		}
	}
}