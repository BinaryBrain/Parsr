import Vue from 'vue';
import Vuex from 'vuex';
import DocumentService from '@/services/DocumentServices.js';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    selectedPage: 1,
    zoom: 1.0,
    uuid: null,
    inputFileName: null,
    document: null,
    inspectorFilters: {},
    expansionPanels: {
      // 0: panel opened, undefined: panel closed
      pageInspector: 0,
      elementSelector: 0,
      elementInspector: 0,
      wordHierarchy: 0,
    },
    selectedElement: null,
    selectedParentElement: null,
    outputs: {
      markdown: {
        code: null,
        loading: false,
      },
      text: {
        code: null,
        loading: false,
      },
      csv: {
        urls: null,
        loading: false,
        csvs: [],
      },
    },
    loadingConfig: false,
    defaultConfig: {
      extractor: {},
      cleaner: [],
      output: {},
    },
  },
  mutations: {
    setCsvdownLoading(state, loading) {
      state.outputs.csv.loading = loading;
    },
    setMarkdownLoading(state, loading) {
      state.outputs.markdown.loading = loading;
    },
    setTextLoading(state, loading) {
      state.outputs.text.loading = loading;
    },
    setParentElementSelected(state, element) {
      state.selectedParentElement = element !== state.selectedParentElement ? element : null;
    },
    setElementSelected(state, element) {
      state.selectedElement = element !== state.selectedElement ? element : null;
      state.selectedParentElement = null;
    },
    setInspectorFilters(state, filters) {
      state.inspectorFilters = filters;
    },
    setSelectedPage(state, page) {
      state.selectedPage = page;
    },
    zoomIn(state) {
      state.zoom = Number((state.zoom + 0.2).toFixed(2));
    },
    zoomOut(state) {
      state.zoom = Number((state.zoom - 0.2).toFixed(2));
    },
    fitZoom(state, zoom) {
      state.zoom = zoom;
    },
    setInputFileName(state, name) {
      state.inputFileName = name;
    },
    SET_DOCUMENT(state, document) {
      state.document = document;
    },
    SET_DOCUMENT_TEXT(state, textCode) {
      state.outputs.text.code = textCode;
    },
    SET_DOCUMENT_MARKDOWN(state, markDownCode) {
      state.outputs.markdown.code = markDownCode;
    },
    SET_DOCUMENT_CSV_LIST(state, csvUrls) {
      state.outputs.csv.urls = csvUrls;
      if (!csvUrls) {
        state.outputs.csv.csvs = [];
      }
    },
    SET_DOCUMENT_CSV_ITEM(state, { index, csv }) {
      state.outputs.csv.csvs.splice(index, 0, csv);
      if (state.outputs.csv.csvs.length === state.outputs.csv.urls.length) {
        state.outputs.csv.loading = false;
      }
    },
    SET_DOCUMENT_ID(state, id) {
      state.uuid = id;
    },
    switchExpansionPanel(state, { panel, value }) {
      Vue.set(state.expansionPanels, panel, value);
    },
    SET_DEFAULT_CONFIG(state, config) {
      Vue.set(state, 'defaultConfig', config);
    },
    LOADING(state, value) {
      Vue.set(state, 'loadingConfig', value);
    },
  },
  actions: {
    getDefaultConfiguration({ commit }) {
      commit('LOADING', true);
      return DocumentService.getDefaultConfiguration().then(({ data }) => {
        commit('SET_DEFAULT_CONFIG', data);
        commit('LOADING', false);
        return data;
      });
    },
    fetchThumbnail(_, { page }) {
      return DocumentService.getThumbnail(this.state.uuid, page);
    },
    fetchDocument({ commit }) {
      return DocumentService.getDocument(this.state.uuid).then(response => {
        commit('SET_DOCUMENT', DocumentService.normalizeWordsSpace(response.data));
        return response.data;
      });
    },
    fetchDocumentText({ commit }) {
      commit('setTextLoading', true);
      return DocumentService.getDocumentText(this.state.uuid).then(response => {
        commit('setTextLoading', false);
        commit('SET_DOCUMENT_TEXT', response.data);
        return response.data;
      });
    },
    fetchDocumentMarkdown({ commit }) {
      commit('setMarkdownLoading', true);
      return DocumentService.getDocumentMarkdown(this.state.uuid)
        .then(response => {
          commit('setMarkdownLoading', false);
          commit('SET_DOCUMENT_MARKDOWN', response.data);
          return response.data;
        })
        .catch(error => {
          commit('setMarkdownLoading', false);
          throw error;
        });
    },
    fetchDocumentCsvList({ commit }) {
      commit('setCsvdownLoading', true);
      return DocumentService.getDocumentCsvs(this.state.uuid)
        .then(response => {
          commit('SET_DOCUMENT_CSV_LIST', response.data);
          if (Array.isArray(response.data) && response.data.length > 0) {
            for (const url in response.data) {
              DocumentService.getDocumentCsv(response.data[url]).then(response => {
                commit('SET_DOCUMENT_CSV_ITEM', { index: url, csv: response.data });
              });
            }
          } else {
            commit('setCsvdownLoading', false);
            return response.data;
          }
        })
        .catch(error => {
          commit('setCsvdownLoading', false);
          throw error;
        });
    },
    postDocument({ commit }, { file, configuration }) {
      return DocumentService.postDocument(file, configuration).then(response => {
        commit('SET_DOCUMENT_ID', response.data);
        commit('SET_DOCUMENT', null);
        commit('SET_DOCUMENT_TEXT', null);
        commit('SET_DOCUMENT_MARKDOWN', null);
        commit('SET_DOCUMENT_CSV_LIST', null);
        commit('setInputFileName', file.name);
        commit('setElementSelected', null);
        commit('setParentElementSelected', null);
        commit('setSelectedPage', 1);
        return response.data;
      });
    },
    getDocumentStatus() {
      return DocumentService.getDocumentStatus(this.state.uuid).then(response => {
        return response.data;
      });
    },
  },
  getters: {
    currentPageElements(state) {
      try {
        return state.document.pages[state.selectedPage - 1].elements;
      } catch (e) {
        return [];
      }
    },
    fonts(state) {
      return state.document ? state.document.fonts : [];
    },
    documentPages(state) {
      return state.document ? state.document.pages.length : 0;
    },
    wordFont: state => fontId => {
      return state.document.fonts.filter(font => font.id === fontId).shift();
    },
    pageInspectorSwitchState(state) {
      return state.expansionPanels.pageInspector;
    },
    elementSelectorSwitchState(state) {
      return state.expansionPanels.elementSelector;
    },
    elementInspectorSwitchState(state) {
      return state.expansionPanels.elementInspector;
    },
    wordHierarchySwitchState(state) {
      return state.expansionPanels.wordHierarchy;
    },
    fontInspectorSwitchState(state) {
      return state.expansionPanels.fontInspector;
    },
  },
});
