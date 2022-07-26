## 日本の「大学」を取得（絞り込み条件付き）
```
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX wikibase: <http://wikiba.se/ontology#>
	
select DISTINCT ?s ?sLabel ?p131Label ?p18 ?p856 ?p571
where{
	#VALUES #Wikidata APIで検索したIDとの置き換え用
	?s wdt:P31/wdt:P279* wd:Q3918 .
	?s wdt:P17 wd:Q17 . #国（wdt:P17）を日本（wd:Q17）に限定
	?s wdt:P131/rdfs:label|wdt:P131/wdt:P131/rdfs:label ?INPUT . #所在地（wdt:P131）
	?s wdt:P131 ?p131 .
	?s wdt:P571 ?p571 .
	OPTIONAL{
	  ?s wdt:P18 ?p18;
	  wdt:P856 ?p856.
	}
	#?s rdfs:label ?LABEL.
	#FILTER(contains(?LABEL,"#LBL#"))
	#FILTER(?p571 >= "####-01-01T00:00:00Z"^^xsd:dateTime)
	SERVICE wikibase:label { bd:serviceParam wikibase:language "ja,en". }
}LIMIT 50	
```