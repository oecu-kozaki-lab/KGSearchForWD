/* 
 * 検索中...アニメーションの表示
 */
function showSearchIng(resultArea){
	const orgDiv = resultArea.innerHTML;
	resultArea.innerHTML=orgDiv+'<div id="searching"><h2>検索中...</h2>'
	   + '<div class="flower-spinner"><div class="dots-container">'
	   +'<div class="bigger-dot"><div class="smaller-dot"></div>'
	   +'</div></div></div>'+'<br></div>' ;
}

function removeSearchIng(){
	const searchingDiv = document.getElementById("searching");
	if(searchingDiv!=null){
		searchingDiv.innerHTML="";
	}
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
			alert("SPARQLクエリのエラーが発生しました");
			removeSearchIng();
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
			alert("sendWdQueryでクエリエラーが発生しました");
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
	return getWdIDsByWM(label,50);
}

async function getWdID(label){
	return getWdIDsByWM(label,1);
}
async function getWdIDsByWM(label,limit){
    const endpoint ="https://www.wikidata.org/w/api.php";
    const options //="?action=wbsearchentities&search="+label+"&limit=50&format=json";
				  = "?action=query&list=search&srsearch="+label+"&srlimit="+limit+"&sroffset="+offset+"&format=json";
    try {
		const result = await sendGetQuery(endpoint,options);
        if (!result.ok) {
			console.log("WikiMedia APIでのクエリエラーが発生しました");
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
			console.log("WikiMedia API【wbsearchentities】のクエリエラーが発生しました");
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

	removeSearchIng();

	let mesText = "";
	let orgDiv = resultArea.innerHTML;
	if(orgDiv.indexOf("<table")>=0){
		mesText = resultArea.innerHTML.replace("</table>","");
	}
	else{
		mesText = "<table>\n<tr>" ;
		for(let j = 0; j < keys.length; j++){
			mesText+='<th style="background:#afeeee">'
					+getSearchPropLabel(keys[j]) +'</th>';
		}
		mesText+="</tr>\n";
	}

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

//検索結果表示用の「項目名」の取得
function getSearchPropLabel(p){
	if(search_prop==null){
		return p;
	}

	if(p=='item'){
		return "QID";
	}
	else if(p=='itemLabel'){
		return "ラベル";
	}

	//optの処理
	for(let i=0;i<search_prop.length;i++){
		if(search_prop[i].id + "Label" == p){
			return search_prop[i].pname; 
		}
	}

	return p;
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
		if(val.toUpperCase().match(/\.(jpg)$/i)
			|| val.toUpperCase().match(/\.(png)$/i)
			|| val.toUpperCase().match(/\.(jpeg)$/i)
			|| val.toUpperCase().match(/\.(gif)$/i)
			|| val.toUpperCase().match(/\.(svg)$/i)){
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

	labelText += '<table class="result-table">' ;
		
	for(let i=0 ;i<len;i++){
		let prop = data[i]['p'].value.replace("http://www.wikidata.org/prop/direct/","wdt:");
		if(prop.endsWith("rdf-schema#label")){
			labelText += showData(data[i]);
		}
		else if(prop.endsWith("core#altLabel")){
			altLabelText += showData(data[i]);
		}
		else if(prop.endsWith("schema.org/description")){
			descText += showData(data[i]);
		}
		else if(prop.endsWith("P279")){
			subCls += showData(data[i]);
		}
		else if(prop.endsWith("P31")){
			insOf += showData(data[i]);
		}
		//wdt:以外のプロパティは表示しない【暫定処理】
		else if(prop.startsWith("wdt:")){
			let sw = true;
			for(let j=0 ;j<propLen;j++){
				if(prop.endsWith(props[j])){	
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

	// labelText += "</table>\n" ;

	let mesText = labelText + altLabelText + descText +"</table><hr>";

	if(""!=(subCls+insOf)){
		mesText += '<table class="result-table">'+subCls + insOf +"</table><hr>";
	}

	let propText = "";
	for(let j=0 ;j<propLen;j++){
		propText += texts[j];
	}

	if(otherText!=""){
		otherText = '<table class="result-table">' + otherText +"</table>";	
	}

	//表示するプロパティを指定している場合は，「すべて表示」ボタンでの制御を追加
	if(propText!=""){
		mesText += '<table class="result-table">'+propText +"</table><hr>";
		mesText +='<input type="button" id="show_other" value="▼すべて表示" onclick="showOther()">'
					+'<input type="button" id="hide_other"'
				+' style="display: none;" value="▲表示を減らす" onclick="hideOther()"><br>'
		mesText += '<div id="other_prop" style="display: none;" >'+otherText+'</div>';
	}
	else{
		mesText += otherText;
	}

	console.log(mesText);

	resultArea.innerHTML = mesText;
}

function showOther(){
	document.getElementById("other_prop").style.display = 'block';
	document.getElementById("show_other").style.display = 'none';
	document.getElementById("hide_other").style.display = 'block';
}

function hideOther(){
	document.getElementById("other_prop").style.display = 'none';
	document.getElementById("show_other").style.display = 'block';
	document.getElementById("hide_other").style.display = 'none';
}

function showData(data_i){
	var mesText = "" ;
	
	if(data_i['propLabel']!=null){//wdt:XXXの述語処理
		const prop = '<b>'+data_i['propLabel'].value + '</b>'
		             +'['+ data_i['prop'].value.replace('http://www.wikidata.org/entity/','wdt:') +']';
		let object = "";

		if(data_i['o'].value.startsWith('http://www.wikidata.org/entity/')){//目的語がwd:XX
			const qid = data_i['o'].value.replace('http://www.wikidata.org/entity/','wd:');
			object += '<b>'+ data_i['oLabel'].value + '</b>' +
					'<a href="'+detail_html+'?key='+qid+ '">'+
					'['+qid+']</a>';
		}
		else if(data_i['o'].value.startsWith('http')){//目的語がURL
			if(data_i['o'].value.endsWith('.jpg')
				|| data_i['o'].value.endsWith('.JPG')
				|| data_i['o'].value.endsWith('.png')
				|| data_i['o'].value.endsWith('.svg')
				|| data_i['o'].value.endsWith('.jpeg')){
					object += '<img src="'+data_i['o'].value +'" width="180">'+'</img>';
			}
			else{
				object += '<a href="'+data_i['o'].value.replace('http://','https://') 
				        +'" target="_blank">'+ data_i['oLabel'].value+'</a>';
				}
		}
		else{//目的語がそれ以外
			object += data_i['oLabel'].value;
		}
		return '<tr><th>'+ prop + '</th><td>'+ object +'</td></tr>';
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
		mesText+='<tr><th><b>名前</b></th><td>'
				+ data_i['oLabel'].value+'</td></tr>';
		//mesText += '名前 - '+ data_i['oLabel'].value+'<br>';
	}
	else if(data_i['p'].value=="http://www.w3.org/2004/02/skos/core#altLabel"){
		mesText+='<tr><th><b>別名</b></th><td>'
				+ data_i['oLabel'].value+'</td></tr>';
		//mesText += '別名 - '+ data_i['oLabel'].value+'<br>';
	}
	else if(data_i['p'].value=="http://schema.org/description"){
		mesText+='<tr><th><b>説明</b></th><td>'
				+ data_i['oLabel'].value+'</td></tr>';
		// mesText += '説明 - '+ data_i['oLabel'].value+'<br>';
	}
	else{//wdt:XXX以外の述語の処理
		mesText += data_i['p'].value+' - '+
					data_i['oLabel'].value+'<br>';
	}

	//フォーマット調整
	// mesText = mesText.replace('-01-01T00:00:00Z','');//日付について「年のみ」の場合は不要部分を削除
	// mesText = mesText.replace('T00:00:00Z','');//日付について「年月日のみ」の場合は不要部分を削除

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

/*
 * 検索表示項目の設定
 */
function loadSearchProps(propData){  
	let propText = "";
	for(let i=0;i<propData.length;i++){
		let ck = "";
		if(propData[i].optional){
			ck ="checked";
		}
		propText += '項目名:<input type="text" id="'+propData[i].id + '_name" '
				 +  'value="'+propData[i].pname+'" size="20"/>';
		propText += ' ID:<input type="text" id="'+propData[i].id + '" '
				 +  'value="'+propData[i].prop+'" size="20"/>';
		propText += '<input type="checkbox" id="'+propData[i].id+'_ck" ' + ck +'><br>';
	}

	return propText;

	// <input type="text" id="opt1" class="opt" value="wdt:P131" size="20"/>
    // <input type="checkbox" id="opt1_ck"><br>
}

/* ------------------------------
 Loading イメージ表示関数
 ------------------------------ */
 function dispLoading(msg){
	// 引数なし（メッセージなし）を許容
	if( msg == undefined ){
	msg = "処理中...";
	}
	// 画面表示メッセージ
	var dispMsg = "<div class='loadingMsg'>" + msg + "</div>";
	// ローディング画像が表示されていない場合のみ出力
	if(document.getElementById("loading") == null){
	document.body.insertAdjacentHTML('afterbegin',"<div id='loading'>" + dispMsg + "</div>");
	}
   }
	
   /* ------------------------------
	Loading イメージ削除関数
	------------------------------ */
   function removeLoading(){
	document.getElementById("loading").remove();
   }
