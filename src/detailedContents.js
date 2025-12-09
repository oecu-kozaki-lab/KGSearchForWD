/* 
    引数は、SPARQL結果のJSON(現時点では、)
    戻り値は、単一のHTMLエレメント（入れ子あり） */
const detailedContents = (elementCreator, bundledData) => {
  // console.log(bundledData);
  return elementCreator(bundledData);
};

const checkFileExtension = (filename) => (allowedExtensions) => {
  const extension = filename.slice(filename.lastIndexOf('.'));
  // 拡張子が許可されたリストに完全一致するかチェック
  return allowedExtensions.some((ext) => `.${ext}` === extension.toLowerCase());
};

const createTable = (bundledData) => {
  const createTabelRows = (inputData) => {
    /* https://developer.mozilla.org/ja/docs/Web/Media/Formats/Image_types
      上に従い定義
    */
    const imgExtensions = [
      'apng',
      'avif',
      'gif',
      'jpg',
      'jpeg',
      'jfif',
      'pjpeg',
      'pjp',
      'png',
      'svg',
      'webp',
    ];
    const wikidataNS = ['http://www.wikidata.org/entity/', 'wd:'];
    /* thがproperty, tdがobjectの情報を表示する */
    // console.log(inputData);
    const propIri = inputData?.get('iri') ?? 'null iri';
    const propLabel = inputData?.get('label') ?? propIri;
    const objs = inputData?.get('objs') ?? [];
    return objs.map((obj, i) => {
      // console.log(obj);
      const tr = document.createElement('tr');
      if (i == 0) {
        const th = document.createElement('th');
        th.rowSpan = objs.length;
        if (propIri.startsWith('http://www.wikidata.org/entity/')) {
          const aTag = `<a href="${propIri}" target="_blank">${propIri.replace(
            'http://www.wikidata.org/entity/',
            'wd:'
          )}</a>`;
          th.innerHTML = `${propLabel}[${aTag}]`;
        } else if (propIri.startsWith('http://www.wikidata.org/prop/direct/')) {
          const aTag = `<a href="${propIri}" target="_blank">${propIri.replace(
            'http://www.wikidata.org/prop/direct/',
            'wdt:'
          )}</a>`;
          th.innerHTML = `${propLabel}[${aTag}]`;
        } else th.innerText = propLabel;
        tr.append(th);
      }
      const td = ((obj) => {
        // 目的語の内容によって、テキストの内容を変える
        // console.log(obj);
        const object = obj.get('o');
        const objectLabel = obj?.get('oLabel') ?? {};
        const objType = object?.['type'];
        const td = document.createElement('td');
        // console.log('createTabelRows');
        if (objType == 'literal') {
          if (obj.get('o')?.['xml:lang']) {
            td.innerText = `${objectLabel['value']}(${object['xml:lang']})`;
          } else {
            td.innerText = `${objectLabel['value']}`;
          }
        } else if (objType == 'uri') {
          const uri = object['value'];
          // console.log(uri);
          if (uri.startsWith('http://www.wikidata.org/entity/')) {
            /* wikidata Entity */
            const label = objectLabel['value'] ?? '';
            const aTag = `<a href="${uri}" target="_blank">${uri.replace(
              'http://www.wikidata.org/entity/',
              'wd:'
            )}</a>`;
            td.innerHTML = `${label}[${aTag}]`;
          } else if (checkFileExtension(object['value'])(imgExtensions)) {
            /* 画像 */
            // console.log(object['value']);
            // console.log(checkFileExtension(object['value'])(imgExtensions));
            const img = document.createElement('img');
            img.src = object['value'];
            td.append(img);
          } else {
            td.innerHTML = `<a href="${uri}" target="_blank">${uri}</a>`;
          }
        } else {
          td.innerText = `${objectLabel['value']}`;
        }
        return td;
      })(obj);
      tr.append(td);
      // console.log(tr);
      return tr;
    });
  };
  const table = document.createElement('table');
  table.classList.add('result-table');
  // console.log(bundledData);
  const trs = Array.from(bundledData)
    .map(([iri, value]) => createTabelRows(value))
    .flat();
  table.append(...trs);
  return table;
};
