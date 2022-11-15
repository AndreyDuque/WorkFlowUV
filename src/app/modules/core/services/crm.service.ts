import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { ServicesEnum } from "../utils/services.enum";

@Injectable({
  providedIn: 'root'
})
export class CrmService {
  crm = environment.crm

  constructor(private readonly http: HttpClient) {
  }

  getDealForId(id: string) {
    const params = new HttpParams()
      .set('id', `${id}`)
    return this.http.get(`${this.crm}/crm.deal.get.json`, { params })
  }

  getDealList(start: number, options: any) {
    const params = new HttpParams()
      .set('start', `${start}`)
    const body = options;
    return this.http.post(`${this.crm}/crm.deal.list.json`, body, { params });
  }

  getDealProductList(id: string) {
    const params = new HttpParams()
      .set('id', `${id}`)
    return this.http.get(`${this.crm}/crm.deal.productrows.get.json`, { params });
  }

  getCompanyList(start: number, id: string, options: any) {
    const params = new HttpParams()
      .set('id', `${id}`)
      .set('start', `${start}`)
    const body = options;
    return this.http.post(`${this.crm}/crm.company.list.json`, body, { params });
  }

  enviarProgramacion(service: string, programacion: any, embudo: string) {

    if (!programacion && !embudo) return;

    let fields: any = {
      TITLE: `${programacion.obra}`,
      CATEGORY_ID: `${embudo}`,
      COMPANY_ID: `${programacion.idCompañia}`,
      UF_CRM_1659706567283: `${programacion.placa}`,
      UF_CRM_1659706553211: `${programacion.obra}`,
    }

    if (service === ServicesEnum.maquina) {
      fields = {
        TITLE: `${programacion.obra}`,
        CATEGORY_ID: `${embudo}`,
        COMPANY_ID: `${programacion.idCompañia}`,
        UF_CRM_1659706567283: `${programacion.placa}`,
        UF_CRM_1659706553211: `${programacion.obra}`,
        UF_CRM_1654545301774: `${programacion.standBy}`,
        UF_CRM_1654545361346: `${programacion.horasStandBy}`
      }
    }

    if (service === ServicesEnum.grua) {
      fields = {
        TITLE: `${programacion.obra}`,
        CATEGORY_ID: `${embudo}`,
        COMPANY_ID: `${programacion.idCompañia}`,
        UF_CRM_1659706567283: `${programacion.placa}`,
        UF_CRM_1659706553211: `${programacion.obra}`,
        UF_CRM_1654545135809: [`${programacion.origen}`],
        UF_CRM_1654545151906: [`${programacion.destino}`]
      }
    }

    const body = { fields }

    return this.http.post(`${this.crm}/crm.deal.add`, body).toPromise();
  }

  agregarProductosANuevaProgramacion(id: string, rows: any[]) {
    const body = {
      id,
      rows,
    }
    return this.http.post(`${this.crm}/crm.deal.productrows.set`, body);
  }

  actualizarProgramacion(id: string, programationUpdate: any, embudo: string, image: any[]) {

    let fields: any;
    if (embudo === "9") {
      fields = {
        UF_CRM_1654626530423: `${programationUpdate.numRecibo}`,
        UF_CRM_1654627704711: `${programationUpdate.horometroInicial}`,
        UF_CRM_1654627722206: `${programationUpdate.horometroFinal}`,
        UF_CRM_1654545301774: `${programationUpdate.standByField}`,
        UF_CRM_1654545361346: `${programationUpdate.horasStandBy}`,
        UF_CRM_1666815383169: `${programationUpdate.state}`,
        // UF_CRM_1655990970100: // image,
        UF_CRM_1663948727860: image,
        // UF_CRM_1663029727124: image,
        STAGE_ID: `${programationUpdate.etapa}`,
      }
    }
    if (embudo === "7") {
      fields = {
        UF_CRM_1654626530423: `${programationUpdate.numRecibo}`,
        UF_CRM_1654627437663: `${programationUpdate.cantidad}`,
        // UF_CRM_1655990970100: // image,
        UF_CRM_1663948727860: image,
        // UF_CRM_1663029727124: image,
        STAGE_ID: `${programationUpdate.etapa}`,
      }
    }
    if (embudo === "3") {
      fields = {
        UF_CRM_1654626530423: `${programationUpdate.numRecibo}`,
        // UF_CRM_1655990970100: // image,
        UF_CRM_1663948727860: image,
        // UF_CRM_1663029727124: image,
        STAGE_ID: `${programationUpdate.etapa}`,
      }
    }

    const body = {
      id,
      fields
    }
    return this.http.post(`${this.crm}/crm.deal.update`, body);

  }

  uploadImage(url: string, file: File) {
    let body = new FormData();
    body.append('file', file)
    return this.http.post(`${url}`, body)
  }

  uploadImage2() {
    let body = { id: 3 };
    return this.http.post(`${this.crm}/disk.folder.uploadFile?id=289`, body);
  }

  showImage(id: number) {
    let body = { id: id }
    return this.http.post(`${this.crm}/disk.file.getExternalLink`, body);
  }

}
