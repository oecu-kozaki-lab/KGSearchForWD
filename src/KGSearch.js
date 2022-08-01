/* 
 * 検索中...アニメーションの表示
 */
function showSearchIng(resultArea){
	resultArea.innerHTML="<h2>検索中...</h2>"
	   + '<div class="flower-spinner"><div class="dots-container">'
	   +'<div class="bigger-dot"><div class="smaller-dot"></div>'
	   +'</div></div></div>';
}


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
 * endpointで指定されたSPARQLエンドポイントにクエリを送信
 */
async function sendSPARQLQuery(endpoint,options){
    try {
		const result = await sendQuery(endpoint,options);
        if (!result.ok) {
			alert("クエリエラーが発生しました");
            return null;
        }		
        const resultData = await result.json();	
        console.log(resultData);

		return resultData;
    } catch (e) {
            alert(e.message);
        throw e;
    }
}


/*
 * GETでAPIにクエリ送信
 */
function sendGetQuery(endpoint, options) {
	var url = endpoint + options +"&origin=*";

	const headers = {
		Accept: 'application/results+json'
	}
	return fetch(url, {
		method: 'GET',
		// headers,
		cache: 'no-cache',
  	});
}


//WikiMedia APIを使ってIDを取得
async function sendWdQuery(endpoint,options){
    try {
		const result = await sendGetQuery(endpoint,options);
        if (!result.ok) {
			alert("クエリエラーが発生しました");
            return null;
        }		
        const resultData = await result.json();	
        console.log(resultData);

		return resultData;
    } catch (e) {
            alert(e.message);
        throw e;
    }
}



//WikiMedia APIを使ってIDを取得
async function getWdIDs(label){
    const endpoint ="https://www.wikidata.org/w/api.php";
    const options //="?action=wbsearchentities&search="+label+"&limit=50&format=json";
				  = "?action=query&list=search&srsearch="+label+"&srlimit=50&format=json";
    try {
		const result = await sendGetQuery(endpoint,options);
        if (!result.ok) {
			console.log("クエリエラーが発生しました");
            return;
        }		
        const resultData = await result.json();	
        console.log(resultData);

		const data = resultData.query.search;
		let ids = new Array();
		for(let i = 0; i < data.length; i++){
			// ids.push(data[i].id);
			ids.push(data[i].title);			
		}
		return ids;
    } catch (e) {
            alert(e.message);
        throw e;
    }
}

//WikiMedia APIを使ってIDを取得【wbsearchentities】
//こちらは「前方一致」のみ？
async function getWdIDsBySE(label){
    const endpoint ="https://www.wikidata.org/w/api.php";
    const options ="?action=wbsearchentities&search="+label+"&language=en&limit=50&format=json";
    try {
		const result = await sendGetQuery(endpoint,options);
        if (!result.ok) {
			console.log("クエリエラーが発生しました");
            return;
        }		
        const resultData = await result.json();	
        console.log(resultData);

		const data = resultData.search;
		let ids = new Array();
		for(let i = 0; i < data.length; i++){
			ids.push(data[i].id);
		}
		return ids;
    } catch (e) {
            alert(e.message);
        throw e;
    }
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
			let val = "-";
			if(data[i][keys[j]]!=null){
				val =data[i][keys[j]].value;
			}
            if(keys[j]==keylink){ //変数名が「keylink」のときは詳細表示へのリンク
                mesText += '<th>'+getLinkURL(val)+'</th>';
            }
            else{
                mesText += '<th>'+getHtmlData(val)+'</th>';
            }			
		}
		mesText+="</tr>";
	}
	resultArea.innerHTML = mesText+'</table>';
}

function getHtmlData(val){
	if(val.startsWith('http://www.wikidata.org/entity/')){//wd:XX
		return '<a href="'+val.replace('http://','https://') + '" target="_blank">'+
			'wd:'+val.replace('http://www.wikidata.org/entity/','')+'</a>';
	}
	else if(val.startsWith('http://www.wikidata.org/prop/direct/')){//wdt:XX
		return '<a href="'+val.replace('http://','https://') + '" target="_blank">'+
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
			return '<a href="'+val.replace('http://','https://') +'" target="_blank">'+val+'</a>';
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
function showResultDetails(resultData,resultArea,props){
	//表示するプロパティの順番を設定
	//const props = ["P17","P131","P18","P856","P571"];
	let propLen = 0;
	if(props!=null){
		propLen = props.length;	
	} 
	const data = resultData.results.bindings;
	const len = data.length;

	if(len==0){
		resultArea.innerHTML = "検索結果なし";
		return;
	}

	//ラベル,説明,上位クラス
	let labelText = "";
	let altLabelText = "";
	let descText = "";
	let subCls = "";
	let insOf = "";
	
	//順番を指定したプロパティ用
	let texts = [];
	for(let j=0 ;j<propLen;j++){
		texts.push('');
	}

	//その他用
	let otherText = "";
	
	//見出し語部分
	if(data[0]['item']!=null){
		labelText += '<h2 style="background:#afeeee">'+data[0]['itemLabel'].value
			+'<br><font size="3">（Wikidata ID:<a href="'+data[0]['item'].value.replace('http://','https://')
			+'" target="_blank">'
            +data[0]['item'].value.replace('http://www.wikidata.org/entity/',"")
            +'</a>）</font></h2>';
	}

	for(let i=0 ;i<len;i++){
		if(data[i]['p'].value.endsWith("rdf-schema#label")){
			labelText += showData(data[i]);
		}
		else if(data[i]['p'].value.endsWith("core#altLabel")){
			altLabelText += showData(data[i]);
		}
		else if(data[i]['p'].value.endsWith("schema.org/description")){
			descText += showData(data[i]);
		}
		else if(data[i]['p'].value.endsWith("P279")){
			subCls += showData(data[i]);
		}
		else if(data[i]['p'].value.endsWith("P31")){
			insOf += showData(data[i]);
		}
		else{
			let sw = true;
			for(let j=0 ;j<propLen;j++){
				if(data[i]['p'].value.endsWith(props[j])){	
					texts[j] += showData(data[i]);
					sw = false;
					break;
				}
			}
			if(sw){
				otherText += showData(data[i]);
			}
		}
	}

	let mesText = labelText + altLabelText  + descText +"<hr>";
	if(""!=(subCls+insOf)){
		mesText += subCls + insOf +"<hr>";
	}

	let propText = "";
	for(let j=0 ;j<propLen;j++){
		propText += texts[j];
	}
	if(propText!=""){
		mesText += propText +"<hr>";	
	}
	mesText += otherText;
	
	resultArea.innerHTML = mesText;
}



function showData(data_i){
	var mesText = "" ;
	if(data_i['propLabel']!=null){//wdt:XXXの述語処理
		const prop = '<b>'+data_i['propLabel'].value + '</b>'
		             +'['+ data_i['prop'].value.replace('http://www.wikidata.org/entity/','wdt:') +']';
		
		if(data_i['o'].value.startsWith('http://www.wikidata.org/entity/')){//目的語がwd:XX
			const qid = data_i['o'].value.replace('http://www.wikidata.org/entity/','wd:');
			mesText += prop +' - <b>'+ data_i['oLabel'].value + '</b>' +
					'<a href="'+detail_html+'?key='+qid+ '">'+
					'['+qid+']</a><br>';
		}
		else if(data_i['o'].value.startsWith('http')){//目的語がURL
			if(data_i['o'].value.endsWith('.jpg')
				|| data_i['o'].value.endsWith('.JPG')
				|| data_i['o'].value.endsWith('.png')
				|| data_i['o'].value.endsWith('.svg')){
				mesText += prop +'<br>' + '<img src="'+data_i['o'].value +'" width="300">'+'</img><br>';
			}
			else{
				mesText += prop +' - '+'<a href="'+data_i['o'].value.replace('http://','https://') 
				        +'" target="_blank">'+ data_i['oLabel'].value+'</a><br>';
				}
		}
		else{//目的語がそれ以外
			mesText += prop +' - '+	data_i['oLabel'].value+'<br>';
		}
	}
	else if(data_i['p'].value.startsWith('http://www.wikidata.org/prop/direct-normalized/')){
		if(data_i['o'].value.startsWith('http')){//目的語がURL
			mesText += data_i['p'].value.replace('http://www.wikidata.org/prop/direct-normalized/','wdtn:')+' - '+
						'<a href="'+data_i['o'].value.replace('http://','https://') 
						+'" target="_blank">'+
						data_i['oLabel'].value+'</a><br>';
		}
		else{
			mesText += data_i['p'].value+' - '+	data_i['oLabel'].value+'</a><br>';
		}
	}
	else if(data_i['p'].value=="http://www.w3.org/2000/01/rdf-schema#label"){
		mesText += '名前 - '+ data_i['oLabel'].value+'<br>';
	}
	else if(data_i['p'].value=="http://www.w3.org/2004/02/skos/core#altLabel"){
		mesText += '別名 - '+ data_i['oLabel'].value+'<br>';
	}
	else if(data_i['p'].value=="http://schema.org/description"){
		mesText += '説明 - '+ data_i['oLabel'].value+'<br>';
	}
	else{//wdt:XXX以外の述語の処理
		mesText += data_i['p'].value+' - '+
					data_i['oLabel'].value+'<br>';
	}

	//フォーマット調整
	mesText = mesText.replace('-01-01T00:00:00Z','');//日付について「年のみ」の場合は不要部分を削除
	mesText = mesText.replace('T00:00:00Z','');//日付について「年月日のみ」の場合は不要部分を削除

	return mesText;
}

/*
 * クエリ結果の表示【WikiMedia API用】
 */
function showWdResult(resultData,resultArea){
	const data = resultData.search;
	let mesText = "" ;
	for(let i = 0; i < data.length; i++){
		mesText+= data[i].match.text
			+'（<a href="'+ data[i].concepturi+'" target="_blank">'+data[i].id+ "</a>）<br>\n";
	}
	resultArea.innerHTML = mesText;//+'</table>';
}

/*
 * クエリ結果の表示【WikiMedia API用】
 */
function showWdResultWithLink(resultData,resultArea){
	const data = resultData.search;
	let mesText = "" ;
	for(let i = 0; i < data.length; i++){
		mesText+= data[i].match.text+"（" + getLinkURL(data[i].concepturi)+"）<br>\n";
	}
	resultArea.innerHTML = mesText;//+'</table>';
}
