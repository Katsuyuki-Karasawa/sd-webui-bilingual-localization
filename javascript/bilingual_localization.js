var F={bilingual_localization_enabled:!0,bilingual_localization_logger:!1,bilingual_localization_file:"None",bilingual_localization_dirs:"{}",bilingual_localization_order:"Translation First"};function J(){const f=new Map,w={badge:!0,label:"Logger",enable:!1};return new Proxy(console,{get:(z,R)=>{if(R==="init")return(_)=>{w.label=_,w.enable=!0};if(!(R in z))return;return(..._)=>{if(!w.enable)return;let q=["#39cfe1","#006cab"],O,G;switch(R){case"error":q=["#f70000","#a70000"];break;case"warn":q=["#f7b500","#b58400"];break;case"time":if(O=_[0],f.has(O))console.warn(`Timer '${O}' already exists`);else f.set(O,performance.now());return;case"timeEnd":if(O=_[0],G=f.get(O),G===void 0)console.warn(`Timer '${O}' does not exist`);else f.delete(O),console.log(`${O}: ${performance.now()-G} ms`);return;case"groupEnd":w.badge=!0;break}const H=w.badge?[`%c${w.label}`,`color: #fff; background: linear-gradient(180deg, ${q[0]}, ${q[1]}); text-shadow: 0px 0px 1px #0003; padding: 3px 5px; border-radius: 4px;`]:[];if(z[R](...H,..._),R==="group"||R==="groupCollapsed")w.badge=!1}}})}function D(f){try{const w=f.trim();if(!w.startsWith("/")||w.split("/").length<3){const q=w.replace(/[.*+\-?^${}()|[\]\\]/g,"\\$&");return new RegExp(q)}const z=w.lastIndexOf("/"),R=w.slice(1,z),_=w.slice(z+1);return new RegExp(R,_)}catch(w){return null}}function P(f,w,z,R){f.addEventListener(w,(_)=>{let q=_.target;while(q!==f){if(q.matches(z))R.call(q,_);q=q.parentNode}})}function L(){const f=document.getElementsByTagName("gradio-app"),w=f.length===0?document:f[0];if(w!==document)w.getElementById=(z)=>document.getElementById(z);return w.shadowRoot?w.shadowRoot:w}function U(...f){return L()?.querySelectorAll(...f)||new NodeList}function v(){P(L(),"mousedown","ul.options .item",(f)=>{const{target:w}=f;if(!w.classList.contains("item")){w.closest(".item").dispatchEvent(new Event("mousedown",{bubbles:!0}));return}const z=w.dataset.value,R=w?.closest(".wrap")?.querySelector(".wrap-inner .single-select");if(z&&R)R.title=titles?.[z]||"",R.textContent="__biligual__will_be_replaced__",X(R,z,"element")})}function I(f){const w=new XMLHttpRequest;return w.open("GET",`file=${f}`,!1),w.send(null),w.responseText}function j(f,{deep:w=!1,rich:z=!1}={}){if(!B)return;if(f.matches?.(S))return;if(f.title)X(f,f.title,"title");if(f.placeholder)X(f,f.placeholder,"placeholder");if(f.tagName==="OPTION")X(f,f.textContent,"option");if(w||z)Array.from(f.childNodes).forEach((R)=>{if(R.nodeName==="#text"){if(z){X(R,R.textContent,"text");return}if(w)X(R,R.textContent,"element")}else if(R.childNodes.length>0)j(R,{deep:w,rich:z})});else X(f,f.textContent,"element")}var S=[".bilingual__trans_wrapper",".resultsFlexContainer","#setting_sd_model_checkpoint select","#setting_sd_vae select","#txt2img_styles, #img2txt_styles",".extra-network-cards .card .actions .name","script, style, svg, g, path"];function M(){if(!B())return;const f=J();f.time("Full Page");const w=["label span, fieldset span, button","textarea[placeholder], select, option",".transition > div > span:not([class])",".label-wrap > span",".gradio-image>div.float",".gradio-file>div.float",".gradio-code>div.float","#modelmerger_interp_description .output-html","#modelmerger_interp_description .gradio-html","#lightboxModal span"],z=['div[data-testid="image"] > div > div',"#extras_image_batch > div",".output-html:not(#footer), .gradio-html:not(#footer), .output-markdown, .gradio-markdown","#dynamic-prompting"];w.forEach((R)=>{U(R).forEach((_)=>j(_,{deep:!0}))}),z.forEach((R)=>{U(R).forEach((_)=>j(_,{rich:!0}))}),f.timeEnd("Full Page")}function A(){Z={enabled:F.bilingual_localization_enabled,file:F.bilingual_localization_file,dirs:F.bilingual_localization_dirs,order:F.bilingual_localization_order,enableLogger:F.bilingual_localization_logger};const{enabled:f,file:w,dirs:z,enableLogger:R}=Z;if(!f||w==="None"||z==="None")return;const _=JSON.parse(z),q=J();if(R)q.init("Bilingual");q.log("Bilingual Localization initialized.");const O=/^##(?<scope>.+)##(?<skey>.+)$/;N=JSON.parse(I(_[w]),(G,H)=>{if(G.startsWith("@@")){const $=D(G.slice(2));if($ instanceof RegExp)T.set($,H)}else{const $=G.match(O);if($?.groups){let{scope:W,skey:Q}=$.groups;if(W.startsWith("@"))W=W.slice(1);else W=`#${W}`;if(!W.length)return H;V[W]||={},V[W][Q]=H,Y[Q]||=[],Y[Q].push(W)}else return H}}),M(),v()}function B(){return N}function k(){return T}function b(){return V}function E(){return Y}function K(){return Z}var N=null,T=new Map,V={},Y={},Z=null;function C(f){const w=k();for(let[z,R]of w.entries())if(z instanceof RegExp){if(z.test(f))return J().log("regex",z,f,R),f.replace(z,R)}else console.warn("Expected regex to be an instance of RegExp, but it was a string.");return f}function x(f){return f.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function h(f){const w=document.createElement("template");return w.insertAdjacentHTML("afterbegin",f),w.firstElementChild}function X(f,w,z){if(!B)return;let R=w.trim();if(!R)return;if(g.test(R))return;if(c.test(R))return;let _=B[R]||C(R);const q=E[R];if(q){console.log("scope",f,R,q);for(let G of q)if(f.parentElement.closest(G)){_=b[G][R];break}}if(!_||R===_){if(f.textContent==="__biligual__will_be_replaced__")f.textContent=R;if(f.nextSibling?.className==="bilingual__trans_wrapper")f.nextSibling.remove();return}if(K()?.order==="Original First")[R,_]=[_,R];switch(z){case"text":f.textContent=_;break;case"element":{const G=`<div class="bilingual__trans_wrapper">${x(_)}<em>${x(R)}</em></div>`,H=h(G);if(f.hasChildNodes()){const $=Array.from(f.childNodes).find((W)=>W.nodeType===Node.TEXT_NODE&&W.textContent?.trim()===R||W.textContent?.trim()==="__bilingual__will_be_replaced__");if($){if($.textContent="",$.nextSibling?.nodeType===Node.ELEMENT_NODE&&$.nextSibling.className==="bilingual__trans_wrapper")$.nextSibling.remove();if($.parentNode&&H)$.parentNode.insertBefore(H,$.nextSibling)}}else{if(f.textContent="",f.nextSibling?.nodeType===Node.ELEMENT_NODE&&f.nextSibling.className==="bilingual__trans_wrapper")f.nextSibling.remove();if(f.parentNode&&H)f.parentNode.insertBefore(H,f.nextSibling)}break}case"option":f.textContent=`${_} (${R})`;break;case"title":f.title=`${_}\n${R}`;break;case"placeholder":f.placeholder=`${_}\n\n${R}`;break;default:return _}}var g=/^[\.\d]+$/,c=/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]/u;function y(){const f=document.createElement("style");if(f.textContent)f.textContent=u;else f.appendChild(document.createTextNode(u));L().appendChild(f);let w=!1,z=0;new MutationObserver((_)=>{if(window.localization&&Object.keys(window.localization).length)return;if(Object.keys(F).length===0)return;let q=0;const O=performance.now();for(let H of _)if(H.type==="characterData"){if(H.target?.parentElement?.parentElement?.tagName==="LABEL")j(H.target)}else if(H.type==="attributes")q++,j(H.target);else H.addedNodes.forEach(($)=>{if($ instanceof Element&&$.className==="bilingual__trans_wrapper")return;if(q++,$.nodeType===1&&$ instanceof Element&&/(output|gradio)-(html|markdown)/.test($.className))j($,{rich:!0});else if($.nodeType===3)X($,$.textContent,"text");else j($,{deep:!0})});if(q>0)J().info(`UI Update #${z++}: ${performance.now()-O} ms, ${q} nodes`,_);if(w)return;if(B())return;w=!0,A()}).observe(L(),{characterData:!0,childList:!0,subtree:!0,attributes:!0,attributeFilter:["title","placeholder"]})}var u=`
    .bilingual__trans_wrapper {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    font-size: 13px;
    line-height: 1;
    }

    .bilingual__trans_wrapper em {
    font-style: normal;
    }

    #txtimg_hr_finalres .bilingual__trans_wrapper em,
    #tab_ti .output-html .bilingual__trans_wrapper em,
    #tab_ti .gradio-html .bilingual__trans_wrapper em,
    #sddp-dynamic-prompting .gradio-html .bilingual__trans_wrapper em,
    #available_extensions .extension-tag .bilingual__trans_wrapper em,
    #available_extensions .date_added .bilingual__trans_wrapper em,
    #available_extensions+p>.bilingual__trans_wrapper em,
    .gradio-image div[data-testid="image"] .bilingual__trans_wrapper em {
    display: none;
    }

    #settings .bilingual__trans_wrapper:not(#settings .tabitem .bilingual__trans_wrapper),
    label>span>.bilingual__trans_wrapper,
    fieldset>span>.bilingual__trans_wrapper,
    .label-wrap>span>.bilingual__trans_wrapper,
    .w-full>span>.bilingual__trans_wrapper,
    .context-menu-items .bilingual__trans_wrapper,
    .single-select .bilingual__trans_wrapper, ul.options .inner-item + .bilingual__trans_wrapper,
    .output-html .bilingual__trans_wrapper:not(th .bilingual__trans_wrapper),
    .gradio-html .bilingual__trans_wrapper:not(th .bilingual__trans_wrapper, .posex_cont .bilingual__trans_wrapper),
    .output-markdown .bilingual__trans_wrapper,
    .gradio-markdown .bilingual__trans_wrapper,
    .gradio-image>div.float .bilingual__trans_wrapper,
    .gradio-file>div.float .bilingual__trans_wrapper,
    .gradio-code>div.float .bilingual__trans_wrapper,
    .posex_setting_cont .bilingual__trans_wrapper:not(.posex_bg .bilingual__trans_wrapper), /* Posex extension */
    #dynamic-prompting .bilingual__trans_wrapper
    {
    font-size: 12px;
    align-items: flex-start;
    }

    #extensions label .bilingual__trans_wrapper,
    #available_extensions td .bilingual__trans_wrapper,
    .label-wrap>span>.bilingual__trans_wrapper {
    font-size: inherit;
    line-height: inherit;
    }

    .label-wrap>span:first-of-type {
    font-size: 13px;
    line-height: 1;
    }

    #txt2img_script_container > div {
    margin-top: var(--layout-gap, 12px);
    }

    textarea::placeholder {
    line-height: 1;
    padding: 4px 0;
    }

    label>span {
    line-height: 1;
    }

    div[data-testid="image"] .start-prompt {
    background-color: rgba(255, 255, 255, .6);
    color: #222;
    transition: opacity .2s ease-in-out;
    }
    div[data-testid="image"]:hover .start-prompt {
    opacity: 0;
    }

    .label-wrap > span.icon {
    width: 1em;
    height: 1em;
    transform-origin: center center;
    }

    .gradio-dropdown ul.options li.item {
    padding: 0.3em 0.4em !important;
    }

    /* Posex extension */
    .posex_bg {
    white-space: nowrap;
    }
    `;document.addEventListener("DOMContentLoaded",()=>{y()});
