{{- define "helm-chart-beyond-common.generics.fullname" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 64 | trimSuffix "-"}}
{{- end}}

{{- define "helm-chart-beyond-common.generics.labels" -}}
{{- if .Values.global }}
{{- if .Values.global.labels }}
{{ .Values.global.labels  | toYaml}}
{{- end}}
socle: {{ .Values.global.socleCode}}
service: {{ default .Chart.Name .Values.global.serviceCode}}
{{- end}}
composant: {{ .Chart.Name }}
version: {{ .Values.image.tag }}
{{- if .Values.deployment }}
{{- if .Values.deployment.labels }}
{{ .Values.deployment.labels  | toYaml}}
{{- end}}
{{- end}}
{{- end}}
{{- define "helm-chart-beyond-common.generics.globalAnnotations" -}}
{{- if .Values.global }}
{{- if .Values.global.annotations }}
{{ .Values.global.annotations | toYaml}}
{{- end}}
{{- end}}
{{- end}}
