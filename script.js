function customHttp() {
    return {
      get(url, cb) {
        try {
          const xhr = new XMLHttpRequest(); //создаем объект класса XMLHttpRequest
          xhr.open('GET', url);  /* Здесь мы указываем параметры соединения с сервером, т.е. мы указываем метод соединения GET, 
          а после запятой мы указываем путь к файлу на сервере который будет обрабатывать наш запрос. */ 
          xhr.addEventListener('load', () => { 
            if (Math.floor(xhr.status / 100) !== 2) {
              cb(`Error. Status code: ${xhr.status}`, xhr);
              return;
            }
            const response = JSON.parse(xhr.responseText);  //получаем ответ от сервера
            cb(null, response); //передаем ответ в callback функцию
          });
  
          xhr.addEventListener('error', () => {
            cb(`Error. Status code: ${xhr.status}`, xhr);
          });
  
          xhr.send(); //выполняем запрос
        } catch (error) {
          cb(error);
        }
      },
      post(url, body, headers, cb) {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', url);
          xhr.addEventListener('load', () => {
            if (Math.floor(xhr.status / 100) !== 2) {
              cb(`Error. Status code: ${xhr.status}`, xhr);
              return;
            }
            const response = JSON.parse(xhr.responseText);
            cb(null, response);
          });
  
          xhr.addEventListener('error', () => {
            cb(`Error. Status code: ${xhr.status}`, xhr);
          });
  
          if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
              xhr.setRequestHeader(key, value);
            });
          }
  
          xhr.send(JSON.stringify(body));
        } catch (error) {
          cb(error);
        }
      },
    };
  }
  
  const http = customHttp();
  

  const newsService = (function() {
      const apiKey = 'cc0592ce581842b7b2ab7c05f5086c94';
      const apiUrl = 'http://newsapi.org/v2';

      return {
          topHeadlines(country='ua', category='business', cb) {
            http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`, cb);
        },
          everything(query, cb) {
            http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
        },
      };
  })();

  //Elemets

  const form = document.forms['newsControls'];
  const countrySelect = form.elements['country'];
  const categorySelect = form.elements['category'];
  
  const searchInput = form.elements['searchInput'];

  form.addEventListener('submit', e => {
    e.preventDefault();
    loadNews();
  });

  document.addEventListener('DOMContentLoaded', function() {
      loadNews();
  });


  function loadNews() {
      const country = countrySelect.value;
      const category = categorySelect.value;
     
      const searchText = searchInput.value;

      if (!searchText) {
        newsService.topHeadlines(country, category, onGetResponce);
      } else {
        newsService.everything(searchText, onGetResponce);
      }

      
      
  }

  function onGetResponce(err, res) {
    if (err) {
      alert (err);
      return
    }

    if (!res.articles.length) {
      alert ('Новостей не найдено');
      return;
    }

    renderNews(res.articles);
  }

  function renderNews(news) {
    
    const newsContainer = document.querySelector('#content');
    if (newsContainer.children.length) {
      clearContainer(newsContainer);
    }

    let fragment = '';
    news.forEach(newsItem => {
        const el = newsTemplate(newsItem);
        fragment += el;
    });
    newsContainer.insertAdjacentHTML('afterbegin', fragment);
  }

  function clearContainer(container) {
    container.innerHTML = '';
  }

  function newsTemplate(news) {
    console.log(news);

    return `<div class="post">
    <h2 class="title"><a href="${news.url}">${news.title || ''} </a></h2>
    <p class="meta">Posted by <a href="#">${news.author || ''}</a> on ${news.publishedAt || ''}
        </p>
    <div class="entry">
        <p><img src="${news.urlToImage || '#'}" width="143" height="auto" alt="" class="alignleft border" />${news.description || ''} </p>
    </div>
</div>`
  }