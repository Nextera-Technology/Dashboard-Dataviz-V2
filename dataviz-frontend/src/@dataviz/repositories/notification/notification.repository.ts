import { inject, Injectable } from "@angular/core";
import { GraphqlClient } from "@dataviz/graphql/client";
import { gqlGetAllNotification } from "@dataviz/graphql/queries/notification/notification.query";

@Injectable({
  providedIn: "root",
})
export class NotificationRepository {
  _client = inject(GraphqlClient);

  constructor() {}

  async getAllNotification(pagination: any, filter?: any, sort?: any) {
    try {
      const result = await this._client.GraphqlQuery(gqlGetAllNotification, {
        pagination,
        filter,
        sort,
      });
      return result.getAllNotification;
    } catch (error) {
      throw {
        message: "Failed to get notifications.",
        originalError: error,
        queryOrMutation: gqlGetAllNotification,
        input: JSON.stringify({ pagination, filter, sort }),
      };
    }
  }
}
