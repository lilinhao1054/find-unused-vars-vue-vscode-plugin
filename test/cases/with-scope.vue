<template>
    <div>
        <a-table :columns="columns" :data-source="compoundDerivationSourceList" :pagination="false">
            <div slot="relatedMetricList" slot-scope="relatedMetricList, record">
                <div v-for="(item, index) in relatedMetricList" v-show="index < 9" :key="item">
                    {{ `${item.baseInfo.index}: ` }}
                    <a-tooltip placement="rightTop" overlay-class-name="tooltip-hover" :overlay-style="{
                        maxWidth: '480px',
                    }">
                        <template slot="title">
                            <metric-overview
                                :metric-id="getSourceIdByIdentifier(item.baseInfo.index, record.metricRelation)" />
                        </template>
                        <span class="Metric-hover" @click="$emit('toMetricDetail', item)">{{
                            item.baseInfo.cnName
                            }}</span>
                    </a-tooltip>
                </div>
                <a-tooltip placement="rightTop" overlay-class-name="tooltipColor">
                    <template slot="title">
                        <div class="Source-Metric-item">
                            <Col v-for="item in relatedMetricList" :key="item" span="8">
                            {{ `${item.baseInfo.index}: ${item.baseInfo.cnName}` }}
                            </Col>
                        </div>
                    </template>
                    <div v-show="relatedMetricList.length > 9">
                        ...
                    </div>
                </a-tooltip>
            </div>
        </a-table>
    </div>
</template>

<script>
export default {
    props: {
        relatedMetricList: {
            type: Object,
            default: () => ({}),
        }
    },
    data() {
        return {
            item: {}
        }
    }
}
</script>
<style lang="less" scoped></style>