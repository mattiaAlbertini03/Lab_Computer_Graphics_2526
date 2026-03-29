#ESERCIZIO 4

In questo programma vengono generati 4 cubi a partire di un cubo generato definito 
con coordinate u,v texture/immagine con l'immagine [webgl-marble.png](webgl-marble.png)

Si puo' interagire con il singolo cubo tramite il mouse.

Il primo cubo mostra delle modifiche alle coordinate u,v texture/immagine per 
testarne i valori ed i risultati.

Il secondo cubo mostra altre modifiche alle coordinate ma su un'altra immagine.

Il terzo cubo genera una sky-box e il punto di vista viene fatto partire 
all'interno del cubo. L'immagine è basato su questa [sky-box.png](sky-box.png)

Il quarto codice mostra il cubo con una texture griglia dall'immagine [grid.png](grid.png).
Questo cubo viene fatto visualizzare in maniera distorta andando a modificare il 
vertex shader all'interno del file html dove vengono modificare il valore xyz 
della posizion per poter far si che il sistema generi la distorzione.  


All'interno del file html vengono definiti il vertex shader e il frament shader.
Per poter definire il terzo e il quarto cubo sono stati scritti dei shader differenti. 

Il codice javascript usa le librerie [m4](m4.js) e [webglUtils](webgl-utils.js).  

