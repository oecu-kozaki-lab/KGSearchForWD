
/*
 * endpointで指定されたSPARQLエンドポイントにクエリを送信
 */
function sendQuery(endpoint, sparql) {
	const url = endpoint + "?" + "query="+encodeURIComponent(sparql)+"&output=json"
	const headers = {
		Accept: 'application/sparql-results+json'
	}
	return fetch(url, {
		method: 'GET',
		headers,
		mode: 'cors',
		cache: 'no-cache',
	});
}


/*
 * クエリ結果の表示【テーブル表示用】
 */
function showResult(resultData,resultArea){
	//クエリ結果のJSONデータを「ヘッダ部(keys)」と「値(data)」に分けて処理する
	const keys = resultData.head.vars;
	const data = resultData.results.bindings;

	let mesText = "<table>\n<tr>" ;
	for(let j = 0; j < keys.length; j++){
    	mesText+='<th style="background:#afeeee">'+keys[j]+'</th>';
	}
	mesText+="</tr>\n";

	for(let i = 0; i < data.length; i++){
		mesText+="<tr>";
    	for(let j = 0; j < keys.length; j++){
            if(keys[j]==keylink){ //変数名が「keylink」のときは詳細表示へのリンク
                mesText += '<th>'+getLinkURL(data[i][keys[j]].value)+'</th>';
            }
            else{
                mesText += '<th>'+getHtmlData(data[i][keys[j]].value)+'</th>';
            }			
		}
		mesText+="</tr>";
	}
	resultArea.innerHTML = mesText+'</table>';
}

function getHtmlData(val){
	if(val.startsWith('http://www.wikidata.org/entity/')){//wd:XX
		return '<a href="'+val + '" target="_blank">'+
			'wd:'+val.replace('http://www.wikidata.org/entity/','')+'</a>';
	}
	else if(val.startsWith('http://www.wikidata.org/prop/direct/')){//wdt:XX
		return '<a href="'+val + '" target="_blank">'+
			'wdt:'+val.replace('http://www.wikidata.org/prop/direct/','')+'</a>';
	}
	else if(val.startsWith('http')){//URL
		if(val.endsWith('.jpg')
			|| val.endsWith('.JPG')
			|| val.endsWith('.png')
			|| val.endsWith('.svg')){
				return '<img src="'+val +'" width="100"/>';
		}
		else{
			return '<a href="'+val +'" target="_blank">'+val+'</a>';
		}
	}
		
	return val;
}


/*
 * 詳細表示へのリンク用URLの取得
 */
function getLinkURL(val){
    if(val.startsWith('http://www.wikidata.org/entity/')){//wd:XX
        let key = 'wd:'+val.replace('http://www.wikidata.org/entity/','');
		return '<a href="'+detail_html+'?key='+ key + '" target="details">'+ key+'</a>';
	}
    else{
        return '<a href="'+detail_html+'?key='+ val + '" target="details">'+ val+'</a>';
    }
}


/*
 * クエリ結果の表示処理[指定したデータの詳細表示用]
 */
function showResultDetails(resultData,resultArea){
	const data = resultData.results.bindings;
	const len = data.length;

	let mesText = "" ;
	if(data[0]['s']!=null){
		mesText+='<h2 style="background:#afeeee">'+data[0]['sLabel'].value
			+'<br><font size="3">（Wikidata ID:<a href="'+data[0]['s'].value +'">'
            +data[0]['s'].value.replace('http://www.wikidata.org/entity/',"")
            +'</a>）</font></h2>';
	}

	//表示するプロパティの順番を設定
	const props = ["P17","P131","P18","P856","P571"];
	const propLen = props.length;
	
	for(let j=0 ;j<propLen;j++){	
		for(let i=0 ;i<len;i++){
			if(data[i]['p'].value.endsWith(props[j])){	
				mesText += showData(data[i]);
			}
		}
    }
	//順番を指定していないプロパティの表示
	for(let i=0 ;i<len;i++){
		if(props.indexOf(data[i]['p'].value.replace("http://www.wikidata.org/prop/direct/",""))<0){	
			//console.log(data[i]['p'].value);
			mesText += showData(data[i]);
		}
	}
	
	resultArea.innerHTML = mesText;
}

function showData(data_i){
	var mesText = "" ;
	if(data_i['propLabel']!=null){//wdt:XXXの述語処理
			if(data_i['o'].value.startsWith('http://www.wikidata.org/entity/')){//目的語がwd:XX
				mesText += data_i['propLabel'].value+' - <b>'+
						data_i['oLabel'].value + '</b>' +
						'<a href="'+data_i['o'].value + '" target="_blank">'+
						'['+data_i['o'].value.replace('http://www.wikidata.org/entity/','')+
						']</a><br>';
			}
			else if(data_i['o'].value.startsWith('http')){//目的語がURL
                if(data_i['o'].value.endsWith('.jpg')
					|| data_i['o'].value.endsWith('.JPG')
					|| data_i['o'].value.endsWith('.png')
					|| data_i['o'].value.endsWith('.svg')){
                    mesText += data_i['propLabel'].value+'<br>'+
						'<img src="'+data_i['o'].value +'" width="300">'+
						'</img><br>';
                }
                else{
				    mesText += data_i['propLabel'].value+' - '+
						'<a href="'+data_i['o'].value +'" target="_blank">'+
						data_i['oLabel'].value+'</a><br>';
                    }
			}
            else{//目的語がそれ以外
				mesText += data_i['propLabel'].value+' - '+
						data_i['oLabel'].value+'<br>';
			}
		}
	else{//wdt:XXX以外の述語の処理
		mesText += data_i['p'].value+' - '+
					data_i['oLabel'].value+'</a><br>';
	}

	//フォーマット調整
	mesText = mesText.replace('-01-01T00:00:00Z','');//日付について「年のみ」の場合は不要部分を削除
	mesText = mesText.replace('T00:00:00Z','');//日付について「年月日のみ」の場合は不要部分を削除

	return mesText;
}
